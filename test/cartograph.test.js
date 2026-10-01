import { describe, expect, it } from 'vitest';
import { readBoundedJson } from '../src/api/bounded-json.js';
import quoteWorker, { buildQuote } from '../src/api/quote.js';
import { products } from '../src/data/products.js';

function streamOf(chunks) {
  let cancelled = false;
  let reads = 0;
  const stream = new ReadableStream({
    pull(controller) {
      const chunk = chunks[reads];
      reads += 1;
      if (chunk) controller.enqueue(chunk);
      else controller.close();
    },
    cancel() {
      cancelled = true;
    },
  });
  return { stream, stats: () => ({ cancelled, reads }) };
}

describe('Cartograph quote API', () => {
  it('builds a successful quote with freight and stock remaining', () => {
    const quote = buildQuote({ items: [{ slug: products[0].slug, quantity: 1 }, { slug: products[1].slug, quantity: 1 }] });
    expect(quote.ok).toBe(true);
    expect(quote.lines).toHaveLength(2);
    expect(quote.total).toBeGreaterThan(quote.subtotal);
    expect(quote.quoteId).toMatch(/^CQ-/);
  });

  it('returns 422 when requested quantity exceeds demo stock', async () => {
    const response = await quoteWorker.fetch(new Request('http://local/api/quote', {
      method: 'POST',
      body: JSON.stringify({ items: [{ slug: 'obsidian-bivy', quantity: 9 }] }),
    }));
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.errors[0]).toContain('Obsidian Bivy');
  });

  it('rejects malformed JSON', async () => {
    const response = await quoteWorker.fetch(new Request('http://local/api/quote', { method: 'POST', body: '{"items":' }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, error: 'Quote request must be valid JSON.' });
  });

  it('counts UTF-8 bytes and cancels oversized streams', async () => {
    const encoder = new TextEncoder();
    const { stream, stats } = streamOf([
      encoder.encode('{"items":['),
      new Uint8Array(13_000).fill(65),
      encoder.encode(']}'),
    ]);
    await expect(readBoundedJson(new Request('http://local/api/quote', {
      method: 'POST',
      body: stream,
      duplex: 'half',
    }), 12_288)).rejects.toMatchObject({ status: 413 });
    expect(stats()).toMatchObject({ cancelled: true });
  });

  it('limits quote inputs to known products and positive quantities', () => {
    const quote = buildQuote({ items: [{ slug: 'not-real', quantity: 3 }, { slug: 'lumen-field-lantern', quantity: -1 }] });
    expect(quote.ok).toBe(false);
    expect(quote.lines).toHaveLength(0);
  });
});
