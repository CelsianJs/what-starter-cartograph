export default function Build() {
  return (
    <article class="build page-enter">
      <p class="eyebrow">Agent reference</p>
      <h1>How Cartograph is built.</h1>
      <section><h2>1. Shared product data</h2><p><code>src/data/products.js</code> is the source for cards, product detail routes, quote validation, and generated static aliases. Agents should add products there first, then let <code>scripts/build-vura.mjs</code> create the matching direct routes.</p></section>
      <section><h2>2. Signals and computed state</h2><p><code>src/state/cart.js</code> keeps <code>categoryFilter</code>, <code>terrainFilter</code>, <code>query</code>, <code>cart</code>, <code>quote</code>, <code>receipt</code>, and status copy as What signals. <code>filteredProducts</code>, <code>cartLines</code>, <code>cartCount</code>, and <code>cartSubtotal</code> are computed accessors. Read them as functions inside render or effects; do not sample them once at module scope.</p></section>
      <section><h2>3. Effects and local persistence</h2><p>The persistence effect writes a sanitized <code>{'{ cart, receipt }'}</code> snapshot to localStorage. Corrupt JSON, unknown product slugs, unavailable storage, and denied writes fall back to session memory while the UI keeps working and shows a notice.</p></section>
      <section><h2>4. Router and static aliases</h2><p><code>what-framework/router</code> handles <code>/products/:slug</code>, cart, receipt, build notes, and catch-all 404. Vura also needs direct-addressable HTML, so the build script writes aliases for every product slug plus <code>404.html</code>.</p></section>
      <section><h2>5. Serverless quote validation</h2><p><code>src/api/quote.js</code> is bundled into <code>dist/functions/api_quote/index.js</code>. It uses a byte-counting stream reader, rejects malformed JSON, clamps quantities, checks stock, returns 422 for invalid baskets, and never mutates durable inventory.</p></section>
      <section><h2>6. Real issues and proof</h2><p>The npm install path needed a repo-local <code>.npmrc</code> because npm 10.9.9 hit an arborist peer-resolution bug with Vitest optional browser peers. Verification now uses <code>npm ci && npm test</code>, <code>npm run build</code>, and <code>npm run smoke</code>. Smoke covers direct product route, cart, <code>/api/quote</code>, receipt, real 404, and desktop/mobile screenshots.</p></section>
      <section><h2>7. Production extension points</h2><p>Replace localStorage with auth-scoped durable cart/order storage, make server quote/order state authoritative, add idempotency keys, and integrate payments only after server-side ownership checks exist.</p></section>
    </article>
  );
}
