# Cartograph

Cartograph is a public What Framework starter for an industrial outdoor gear storefront. It demonstrates static content, routeable product detail pages, signal-driven filters and basket state, an effect-backed local receipt, and a bounded Vura serverless quote endpoint.

Planned public source: `https://github.com/CelsianJs/what-starter-cartograph`

Read the detailed implementation guide in [`BUILD.md`](./BUILD.md), or run the app and open `/build`.

## Requirements

- Node.js 22
- npm 10+

## Run locally

```bash
npm ci
npm run dev
```

## Verify

```bash
npm test
npm run build
npm run smoke
```

`npm run smoke` builds the Vura-shaped output, starts the local preview server, completes the product-detail → cart → `/api/quote` → receipt flow in Chromium, verifies a real 404 response, and writes screenshots to:

- `/tmp/cartograph-desktop.png`
- `/tmp/cartograph-mobile.png`

## Deploy to Vura

```bash
npm run build
npx vura-platform deploy
```

Use production deployment only when the Vura project is ready for a stable public URL:

```bash
npx vura-platform deploy --prod
```

The build emits:

- `dist/static` for static pages and generated product aliases.
- `dist/functions/api_quote/index.js` for the serverless quote endpoint.
- `dist/manifest.json` mapping static pages and `/api/quote` for Vura.

## Demo boundaries

Cartograph does not process payments, reserve live inventory, authenticate users, or store shared tenant data. The cart and receipt are browser-local. The quote API validates a bounded request against bundled stock fixtures so agents can copy the serverless shape without inheriting unsafe production claims.

## Production next steps

- Add authenticated customer/session ownership.
- Move stock and orders to durable server-side storage.
- Add idempotent checkout/session APIs before integrating a payment provider.
- Add server-owned tax and fulfillment calculations for real jurisdictions.
- Keep the client cart optimistic, but treat server quote/order state as authoritative.
