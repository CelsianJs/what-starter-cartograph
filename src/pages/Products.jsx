import { categories, terrains } from '../data/products.js';
import { ProductCard } from '../components/ProductCard.jsx';
import { categoryFilter, clearCart, filteredProducts, query, terrainFilter } from '../state/cart.js';

export default function Products() {
  return (
    <section class="page-enter">
      <div class="page-head">
        <p class="eyebrow">Catalog</p>
        <h1>Choose a kit by route, weather, and load.</h1>
        <p>Filters are signal-driven, details are routeable, and every product has a generated static alias for direct deployment.</p>
      </div>
      <div class="filter-rig" aria-label="Catalog filters">
        <label><span>Search</span><input value={query()} onInput={(event) => query(event.target.value)} placeholder="pack, tarp, lantern..." /></label>
        <label><span>Category</span><select value={categoryFilter()} onChange={(event) => categoryFilter(event.target.value)}>{categories.map((category) => <option value={category}>{category}</option>)}</select></label>
        <label><span>Terrain</span><select value={terrainFilter()} onChange={(event) => terrainFilter(event.target.value)}>{terrains.map((terrain) => <option value={terrain}>{terrain}</option>)}</select></label>
        <button class="button ghost" onClick={clearCart}>Clear basket</button>
      </div>
      {filteredProducts().length === 0 ? (
        <div class="empty"><h2>No gear matches that manifest.</h2><p>Clear a filter or search another material.</p></div>
      ) : (
        <div class="product-grid">{filteredProducts().map((product) => <ProductCard product={product} />)}</div>
      )}
    </section>
  );
}
