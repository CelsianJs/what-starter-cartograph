# Cartograph build journal

Status: ready for root review, source publication, and Vura deployment.

Planned public source: `https://github.com/CelsianJs/what-starter-cartograph`

## What this starter shows

- Static routes for `/`, `/products`, each `/products/:slug`, `/cart`, `/receipt`, `/build`, and `/404`.
- A serverless endpoint at `/api/quote` that reads bounded streamed JSON, rejects malformed or oversized bodies, validates stock, and returns no-store JSON.
- What signals for catalog filters, basket quantities, quote status, server quote payload, local receipt, and storage notices.
- What computed accessors for filtered products, cart lines, item count, and subtotal.
- A What effect that persists cart/receipt state and gracefully falls back to memory when localStorage is corrupt or denied.
- Original inline SVG gear artwork; no external image or font dependencies.

## Architecture map

| Concern | Source | Learning point |
| --- | --- | --- |
| Product truth | `src/data/products.js` | Product slugs, static aliases, quote validation, and UI cards all use the same bundled catalog so routes do not drift from data. |
| Shared state | `src/state/cart.js` | Signals are the global state layer. Render code reads `cartLines()`, `cartCount()`, `quoteStatus()`, and `receipt()` as accessors. |
| Derived state | `src/state/cart.js` | `computed` keeps filters and totals pure; quantity mutations only update `cart`, then totals recalculate. |
| Persistence effect | `src/state/cart.js` | One effect writes a sanitized snapshot to localStorage and reports storage denial without crashing the app. |
| Router | `src/routes.js` | Programmatic What router routes cover product detail, cart, receipt, build notes, and catch-all 404. |
| Serverless API | `src/api/quote.js` | Function code imports only shared data and bounded JSON helpers; it does not import DOM/client state. |
| Vura package | `scripts/build-vura.mjs` | The build writes `dist/static`, bundles `dist/functions/api_quote/index.js`, and writes `dist/manifest.json`. |
| Vura config | `vura.json` | Header catch-alls use Vura's `(.*)` pattern, not shell-style `*`, and concrete static aliases avoid unsupported top-level rewrites. |

## Actual implementation notes

Signals and computed values: `categoryFilter`, `terrainFilter`, `query`, `cart`, `quote`, and `receipt` are signals. `filteredProducts`, `cartLines`, `cartCount`, and `cartSubtotal` are computed accessors. The important pattern is to read accessors inside render functions or effects, not once at module scope.

Effects and storage: `safeLoad` accepts missing/corrupt localStorage and only restores product slugs that still exist. The persistence effect writes `{ cart, receipt }`, and if the browser denies storage it writes to a tiny in-memory fallback and updates `storageNotice`. This is why the UI still works in private or blocked-storage contexts.

Router and direct routes: `/products/:slug` renders through the client router, but Vura/static hosting also needs direct-addressable files. `scripts/build-vura.mjs` imports `products` and writes an HTML alias for every product slug, plus `404.html`, before emitting the manifest.

Serverless boundary: `src/api/bounded-json.js` counts bytes from a stream, cancels oversized bodies, and rejects malformed UTF-8/JSON. `src/api/quote.js` validates known product slugs, clamps quantities, returns 422 for stock overflow or empty baskets, and never mutates inventory.

Deployment package boundary: `vura.json` is intentionally small and schema-safe. The `/api/(.*)` and `/products/(.*)` headers use Vura's route matcher syntax; shell-style `*` globs are rejected by the platform. The build already writes concrete static aliases and `404.html`, so no top-level rewrite rule is needed. `scripts/build-vura.mjs` also writes `dist/functions/package.json` with `{ "type": "module" }` and validates required manifest fields (`filePath`, `config`, route flags, `timestamp`, and the non-empty serverless API mapping) before upload.

## Issues encountered and fixes

- Vura output shape: existing starters used more than one output convention. Cartograph follows the newer serverless-friendly layout from Tempo: `dist/static`, `dist/functions/api_quote`, explicit `dist/manifest.json`.
- Vura config upload: the first real-host upload failed before provisioning because `vura.json` used shell-style `*` header globs and an unsupported top-level `rewrites` key. The fix changed catch-alls to `(.*)`, removed the rewrite, and added build-time manifest/package checks so config-shape drift fails locally.
- Static aliases: hand-maintaining product routes would drift. The build script now imports the same product array used by the UI and writes aliases from it.
- Storage resilience: localStorage can be corrupt or denied. The state layer sanitizes loaded data and falls back to memory for session-only edits.
- npm peer resolution: npm 10.9.9 hit an arborist `edgesOut` error around Vitest optional browser peers without legacy peer resolution. The local `.npmrc` sets `legacy-peer-deps=true`, and `npm ci` verifies the lockfile.

## Test proof

- `npm ci && npm test` passed: 5 Vitest checks for quote totals, over-stock rejection, malformed JSON, oversized streamed bodies, and unknown product handling.
- `npm run build` passed: Vite bundle plus 12 Vura pages, `/api/quote`, required manifest fields, and `dist/functions/package.json`.
- `npm run smoke` passed: fresh root render, product cards, cart quote entrypoint copy, all primary nav links with browser back, direct product route, add-to-cart, `/api/quote`, local receipt, real 404, desktop and mobile full-page screenshots.
- Screenshots: `/tmp/cartograph-desktop.png`, `/tmp/cartograph-mobile.png`.

Visual QA note: an earlier smoke captured after a subflow and could miss a blank home body. The later dim/ghost screenshot was diagnosed as capture timing after browser back: DOM inspection showed one header/brand, at-rest body/main opacity `1`, filter `none`, and finite `.page-enter` plus View Transition animations still running during the bad capture. The current smoke waits for finite animations to finish, ignores decorative infinite loops, asserts meaningful root content before any subroute, and writes full-page home screenshots, so a nav-only or mid-transition render fails.

## Known limitations

- Stock is a bundled fixture and is not durable across visitors.
- Receipts are local browser records, not orders.
- No auth, database, shared tenant data, payments, fulfillment, email, tax compliance, or real inventory reservation is claimed.

## Production extension notes

- Replace localStorage with auth-scoped durable cart/order storage.
- Make server quote/order state authoritative and idempotent.
- Integrate payments only after adding server-side ownership checks and idempotency keys.
- Keep bounded body readers and no-store headers for mutation-like APIs.
