import { products } from '../data/products.js';
import { readBoundedJson } from './bounded-json.js';

const MAX_ITEMS = 24;
const MAX_QTY = 20;
const TAX_RATE = 0.0725;

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export function buildQuote(payload) {
  const incoming = Array.isArray(payload?.items) ? payload.items.slice(0, MAX_ITEMS) : [];
  const errors = [];
  const lines = [];

  for (const item of incoming) {
    const slug = String(item?.slug || '').slice(0, 80);
    const quantity = Math.max(0, Math.min(MAX_QTY, Math.round(Number(item?.quantity || 0))));
    const product = products.find((entry) => entry.slug === slug);
    if (!product || quantity <= 0) continue;
    if (quantity > product.stock) {
      errors.push(`${product.name} has ${product.stock} available in demo field stock.`);
    }
    const acceptedQuantity = Math.min(quantity, product.stock);
    if (acceptedQuantity > 0) {
      lines.push({
        slug,
        name: product.name,
        quantity: acceptedQuantity,
        unitPrice: product.price,
        lineTotal: product.price * acceptedQuantity,
        stockRemaining: product.stock - acceptedQuantity,
      });
    }
  }

  if (lines.length === 0) errors.push('Add at least one in-stock item before requesting a quote.');
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shipping = subtotal >= 400 || subtotal === 0 ? 0 : 28;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  return {
    ok: errors.length === 0,
    errors,
    lines,
    subtotal,
    shipping,
    tax,
    total,
    quoteId: `CQ-${String(total + lines.length * 17).padStart(5, '0')}`,
  };
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json({ ok: false, error: 'POST cart lines to create a local field-stock quote.' }, 405);
    }
    try {
      const quote = buildQuote(await readBoundedJson(request));
      return json({ ...quote, checkedAt: new Date().toISOString() }, quote.ok ? 200 : 422);
    } catch (error) {
      return json({ ok: false, error: error.message || 'Quote request failed.' }, error.status || 400);
    }
  },
};
