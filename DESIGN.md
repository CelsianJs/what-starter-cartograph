# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-10-02
- Primary product surfaces: Field-gear storefront, product detail pages, cart/receipt flow, build guide, serverless quote API.
- Evidence reviewed: `what-starter-gather`, `what-starter-harbor`, `what-starter-tempo`, What router/core package docs.

## Brand
- Personality: Industrial expedition outfitter, field-notebook practical, metal-and-canvas materials.
- Trust signals: Clear stock messaging, no fake payments, no invented shipping integrations, visible local-only receipt boundary.
- Avoid: Luxury fashion ecommerce, generic cards, purple SaaS gradients, claiming real inventory or checkout.

## Product goals
- Goals: Show a polished commerce starter with reactive catalog filters, detail routing, cart totals, and a Vura serverless quote/stock validation endpoint.
- Non-goals: Payment processing, auth, durable multi-user stock, fulfillment, taxes by legal jurisdiction.
- Success signals: A user can filter gear, deep-link a product, adjust cart quantities, receive a serverless quote, and reset a local receipt.

## Personas and jobs
- Primary personas: Framework evaluators, agency developers, ecommerce prototype builders.
- User jobs: Copy a storefront shape, learn signals/computed/effects, see a serverless validation boundary.
- Key contexts of use: Public starter gallery, local template clone, Vura deployment smoke.

## Information architecture
- Primary navigation: Field desk, Products, Cart, Receipt, Build.
- Core routes/screens: `/`, `/products`, `/products/:slug`, `/cart`, `/receipt`, `/build`, `/404`.
- Content hierarchy: Hero and product proof first, catalog filters second, cart/quote flow third, agent implementation notes isolated under `/build`.

## Design principles
- Principle 1: Look like rugged equipment that was drawn with a grease pencil and cut from steel.
- Principle 2: Make commerce state obvious: quantity, stock, subtotal, and server validation never hide.
- Tradeoffs: Visual grit is CSS/SVG only; no external fonts or image CDNs to keep starter cloning reliable.

## Visual language
- Color: Charcoal, canvas, oxidized orange, moss, worn brass.
- Typography: Georgia for editorial field-copy paired with compact system-ui labels for utilitarian controls.
- Spacing/layout rhythm: Dense inventory grids and wide ledger rows with generous route headers.
- Shape/radius/elevation: Clipped cards, one-pixel brass rules, inset labels, strong focus outlines.
- Motion: Short transform/opacity route entry, hover elevation, no motion-essential interactions.
- Imagery/iconography: Original inline SVG gear glyphs and topographic line motifs.

## Components
- Existing components to reuse: None directly; copy only framework patterns from earlier starters.
- New/changed components: AppShell, ProductCard, GearMark, quantity controls, quote banner.
- Variants and states: Empty cart, quote loading/error/success, storage denied, unknown product, no catalog matches.
- Token/component ownership: `src/styles.css` owns tokens; data lives in `src/data/products.js`.

## Accessibility
- Target standard: WCAG AA intent for contrast, labels, keyboard access, and semantic buttons/links.
- Keyboard/focus behavior: All filter, quantity, cart, and checkout controls reachable and visible with keyboard.
- Contrast/readability: High contrast foregrounds on dark panels; orange never used as only status cue.
- Screen-reader semantics: Main landmarks, nav labels, status regions for quote/save notices.
- Reduced motion and sensory considerations: CSS respects `prefers-reduced-motion`.

## Responsive behavior
- Supported breakpoints/devices: 360px mobile through desktop.
- Layout adaptations: Catalog grid collapses to one column; cart ledger becomes stacked blocks.
- Touch/hover differences: Controls have large hit areas and hover is decorative only.

## Interaction states
- Loading: Quote button shows `Checking field stock...`.
- Empty: Empty cart points to Products.
- Error: API and localStorage errors surface inline and preserve local session editing.
- Success: Quote summary and local receipt confirmation are explicit.
- Disabled: Quote disabled when cart empty or while checking.
- Offline/slow network: Quote failure keeps local cart and explains retry.
- Quantity editing: select-all/backspace is an intermediate text edit, not a remove action. Keep the SKU row mounted, show helper copy, commit valid 1–20 values live, and make removal an explicit button.

## Content voice
- Tone: Competent, tactile, no hype.
- Terminology: Kit, field stock, depot, manifest, local receipt.
- Microcopy rules: Be honest about demo boundaries outside `/build` when it affects user trust. Keep endpoint names and implementation mechanics in `/build`, not in the product-facing commerce panels.

## Implementation constraints
- Framework/styling system: What Framework 0.13.10, Vite, Vura CLI 0.3.0, CSS modules by convention in one stylesheet.
- Design-token constraints: No external assets; SVGs generated in JSX/data.
- Performance constraints: Small static bundle, bounded API body reader, generated static aliases.
- Compatibility constraints: Node 22, npm ci, Vura function bundle uses browser platform ESM.
- Test/screenshot expectations: Vitest unit/API/storage tests plus Playwright smoke screenshots for desktop and mobile. Body gradients must not tile on short pages; product-card titles align across a three-card row; detail features render as manifest lines; browser smoke must prove keyboard quantity replacement keeps the same focused input node and persists the replacement value.

## Open questions
- [ ] Which real ecommerce backend should production docs recommend first / owner: platform team / impact: future integration guide.
