import { Link } from 'what-framework/router';
import { money } from '../data/products.js';
import { addToCart } from '../state/cart.js';
import { GearMark } from './GearMark.jsx';

export function ProductCard({ product }) {
  return (
    <article class="product-card" style={`--accent:${product.accent}`}>
      <GearMark type={product.glyph} color={product.accent} />
      <p class="eyebrow">{product.category} / {product.terrain}</p>
      <h2><Link href={`/products/${product.slug}`}>{product.name}</Link></h2>
      <p>{product.summary}</p>
      <div class="card-meta">
        <span>{money(product.price)}</span>
        <span>{product.stock} in field stock</span>
      </div>
      <button class="button" onClick={() => addToCart(product.slug)}>Add to kit</button>
    </article>
  );
}
