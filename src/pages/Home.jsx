import { Link } from 'what-framework/router';
import { products, money } from '../data/products.js';
import { cartCount, cartSubtotal } from '../state/cart.js';
import { ProductCard } from '../components/ProductCard.jsx';

export default function Home() {
  const featured = products.slice(0, 3);
  return (
    <section class="page-enter">
      <div class="hero">
        <div>
          <p class="eyebrow">Field-ready commerce</p>
          <h1>Equipment that reads like a manifest, not a mall.</h1>
          <p>Cartograph is a What Framework storefront starter with static catalog routes, reactive basket state, and a bounded Vura serverless quote check.</p>
          <div class="actions">
            <Link class="button" href="/products">Survey products</Link>
            <Link class="button ghost" href="/cart">Review kit</Link>
          </div>
        </div>
        <aside class="manifest-panel" aria-label="Basket summary">
          <span class="map-pin"></span>
          <p class="eyebrow">Current kit</p>
          <strong>{cartCount()} items</strong>
          <span>{money(cartSubtotal())} subtotal</span>
          <small>Quote validation runs through `/api/quote` before a local receipt is written.</small>
        </aside>
      </div>
      <div class="section-head">
        <div>
          <p class="eyebrow">Featured loadout</p>
          <h2>Three routes into the catalog.</h2>
        </div>
        <Link href="/products">Open full catalog</Link>
      </div>
      <div class="product-grid">
        {featured.map((product) => <ProductCard product={product} />)}
      </div>
    </section>
  );
}
