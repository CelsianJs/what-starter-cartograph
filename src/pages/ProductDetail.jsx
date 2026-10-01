import { Link, useParams } from 'what-framework/router';
import { findProduct, money } from '../data/products.js';
import { addToCart } from '../state/cart.js';
import { GearMark } from '../components/GearMark.jsx';

export default function ProductDetail() {
  const params = useParams();
  const product = findProduct(params.slug);
  if (!product) {
    return (
      <section class="page-enter empty">
        <h1>That product is not on the manifest.</h1>
        <p>The catalog route exists, but no bundled product matches this slug.</p>
        <Link class="button" href="/products">Back to catalog</Link>
      </section>
    );
  }
  return (
    <section class="detail page-enter" style={`--accent:${product.accent}`}>
      <div>
        <p class="eyebrow">{product.category} / {product.terrain}</p>
        <h1>{product.name}</h1>
        <p>{product.summary}</p>
        <dl class="specs">
          <div><dt>Price</dt><dd>{money(product.price)}</dd></div>
          <div><dt>Stock</dt><dd>{product.stock} demo units</dd></div>
          <div><dt>Weight</dt><dd>{product.weight}</dd></div>
          <div><dt>Material</dt><dd>{product.material}</dd></div>
        </dl>
        <button class="button" onClick={() => addToCart(product.slug)}>Add to kit</button>
      </div>
      <aside class="detail-art">
        <GearMark type={product.glyph} color={product.accent} />
        <ul>{product.details.map((detail) => <li>{detail}</li>)}</ul>
      </aside>
    </section>
  );
}
