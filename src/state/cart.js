import { computed, effect, signal } from 'what-framework';
import { findProduct, products } from '../data/products.js';

export const STORAGE_KEY = 'what-starter-cartograph-v1';

function emptyState() {
  return { cart: {}, receipt: null };
}

function memoryStore() {
  let state = emptyState();
  return {
    read: () => state,
    write: (next) => {
      state = next;
    },
  };
}

const volatileStore = memoryStore();

function sanitize(raw) {
  const clean = emptyState();
  if (!raw || typeof raw !== 'object') return clean;
  if (raw.cart && typeof raw.cart === 'object') {
    for (const [slug, value] of Object.entries(raw.cart)) {
      const product = findProduct(slug);
      const quantity = Math.max(0, Math.min(20, Math.round(Number(value))));
      if (product && quantity > 0) clean.cart[slug] = quantity;
    }
  }
  if (raw.receipt && typeof raw.receipt === 'object' && Array.isArray(raw.receipt.lines)) {
    clean.receipt = raw.receipt;
  }
  return clean;
}

function loadInitial() {
  if (typeof localStorage === 'undefined') return volatileStore.read();
  try {
    return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
  } catch {
    return volatileStore.read();
  }
}

const initial = loadInitial();

export const categoryFilter = signal('All', 'cartograph.category');
export const terrainFilter = signal('All', 'cartograph.terrain');
export const query = signal('', 'cartograph.query');
export const cart = signal(initial.cart, 'cartograph.cart');
export const receipt = signal(initial.receipt, 'cartograph.receipt');
export const quoteStatus = signal('Ready for field-stock check.', 'cartograph.quoteStatus');
export const quote = signal(null, 'cartograph.quote');
export const storageNotice = signal('Basket is saved locally in this browser.', 'cartograph.storageNotice');

export const filteredProducts = computed(() => {
  const category = categoryFilter();
  const terrain = terrainFilter();
  const text = query().trim().toLowerCase();
  return products.filter((product) => {
    const categoryMatch = category === 'All' || product.category === category;
    const terrainMatch = terrain === 'All' || product.terrain === terrain;
    const textMatch = !text || `${product.name} ${product.summary} ${product.material}`.toLowerCase().includes(text);
    return categoryMatch && terrainMatch && textMatch;
  });
});

export const cartLines = computed(() => Object.entries(cart())
  .map(([slug, quantity]) => ({ product: findProduct(slug), quantity }))
  .filter((line) => line.product && line.quantity > 0));

export const cartCount = computed(() => cartLines().reduce((sum, line) => sum + line.quantity, 0));
export const cartSubtotal = computed(() => cartLines().reduce((sum, line) => sum + (line.product.price * line.quantity), 0));

export function setQuantity(slug, quantity) {
  const product = findProduct(slug);
  if (!product) return;
  const value = Math.max(0, Math.min(20, Math.round(Number(quantity) || 0)));
  cart((current) => {
    const next = { ...current };
    if (value <= 0) delete next[slug];
    else next[slug] = value;
    return next;
  });
  quote(null);
  quoteStatus('Basket changed. Recheck field stock before writing a receipt.');
}

export function addToCart(slug) {
  const current = cart()[slug] || 0;
  setQuantity(slug, current + 1);
}

export function clearCart() {
  cart({});
  quote(null);
  quoteStatus('Basket cleared.');
}

export async function requestQuote(fetcher = fetch) {
  if (cartLines().length === 0) {
    quoteStatus('Add gear before requesting a field-stock quote.');
    return null;
  }
  quoteStatus('Checking field stock...');
  try {
    const response = await fetcher('/api/quote', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: cartLines().map((line) => ({ slug: line.product.slug, quantity: line.quantity })) }),
    });
    const body = await response.json();
    quote(body);
    quoteStatus(body.ok ? `Quote ${body.quoteId} is ready.` : body.errors.join(' '));
    return body;
  } catch {
    quoteStatus('Quote service is unreachable. The local basket is preserved so you can retry.');
    return null;
  }
}

export function writeReceipt() {
  const current = quote();
  if (!current?.ok) {
    quoteStatus('Request a successful quote before writing a local receipt.');
    return null;
  }
  const next = {
    ...current,
    createdAt: new Date().toISOString(),
    localOnly: true,
  };
  receipt(next);
  cart({});
  quoteStatus(`Local receipt ${current.quoteId} written. No payment was collected.`);
  return next;
}

export function resetReceipt() {
  receipt(null);
}

effect(() => {
  const snapshot = { cart: cart(), receipt: receipt() };
  if (typeof localStorage === 'undefined') {
    volatileStore.write(snapshot);
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    storageNotice(`Saved ${cartCount()} item${cartCount() === 1 ? '' : 's'} locally.`);
  } catch {
    volatileStore.write(snapshot);
    storageNotice('Storage is blocked. Basket changes will last for this session only.');
  }
});
