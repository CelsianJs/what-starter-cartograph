import { Link } from 'what-framework/router';
import { products, money } from '../data/products.js';
import { cartCount, cartSubtotal } from '../state/cart.js';
import { ProductCard } from '../components/ProductCard.jsx';

export default function Home() {
  const featured = products.slice(0, 3);
  const manifestLines = () => cartCount() === 0
    ? featured.map((product) => `${product.name} · ${product.terrain}`)
    : [`${cartCount()} selected`, `${money(cartSubtotal())} subtotal`, 'receipt waits for stock check'];
  return (
    <section class="page-enter">
      <div class="hero">
        <div>
          <p class="eyebrow">Field-ready commerce</p>
          <h1>Equipment that reads like a manifest, not a mall.</h1>
          <p>Cartograph is a field storefront for surveying gear, checking stock, and writing an honest local receipt before a real checkout exists.</p>
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
          <ul class="manifest-lines">
            {() => manifestLines().map((line) => <li>{line}</li>)}
          </ul>
          <small>Quotes are checked before your local receipt is written.</small>
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
