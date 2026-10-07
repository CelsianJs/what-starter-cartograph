import { beforeEach, expect, it } from 'vitest';
import { cart, quote, receipt, requestQuote, setQuantity, writeReceipt } from '../src/state/cart.js';

beforeEach(() => { cart({}); quote(null); receipt(null); });
it('discards a quote when its submitted basket changes before response', async () => {
  setQuantity('basalt-frame-pack', 1);
  let finish;
  const pending = requestQuote(() => new Promise((resolve) => { finish = resolve; }));
  setQuantity('basalt-frame-pack', 2);
  finish({ json: async () => ({ ok: true, quoteId: 'old', lines: [{ slug: 'basalt-frame-pack', quantity: 1 }], total: 294 }) });
  await pending;
  expect(quote()).toBeNull();
  expect(writeReceipt()).toBeNull();
  expect(cart()['basalt-frame-pack']).toBe(2);
});
