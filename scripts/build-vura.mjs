import { mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { build } from 'esbuild';
import { products } from '../src/data/products.js';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const staticDir = join(dist, 'static');
const quoteDir = join(dist, 'functions', 'api_quote');

async function write(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

if (!existsSync(join(staticDir, 'index.html'))) {
  throw new Error('Vite output missing dist/static/index.html');
}

const shell = await import('node:fs/promises').then((fs) => fs.readFile(join(staticDir, 'index.html'), 'utf8'));
function alias(path, title, description) {
  const file = path === '/' ? join(staticDir, 'index.html') : join(staticDir, path.slice(1), 'index.html');
  const html = shell
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`)
    .replace('<div id="app"></div>', `<div id="app"><noscript><main><h1>${title}</h1><p>${description}</p></main></noscript></div>`);
  return write(file, html);
}

await alias('/', 'Cartograph — Field gear starter', 'Industrial outdoor commerce built with What Framework and Vura serverless quote validation.');
await alias('/products', 'Products — Cartograph', 'Filter a bundled field-gear catalog by category, terrain, and search.');
for (const product of products) {
  await alias(`/products/${product.slug}`, `${product.name} — Cartograph`, product.summary);
}
await alias('/cart', 'Cart — Cartograph', 'Review a local basket and request a serverless stock quote.');
await alias('/receipt', 'Receipt — Cartograph', 'Browser-local receipt view for a successful quote.');
await alias('/build', 'How Cartograph is built', 'Agent reference for signals, routing, effects, and Vura serverless packaging.');
await alias('/404', 'Route not found — Cartograph', 'Cartograph includes a true 404 document for static hosting.');
await copyFile(join(staticDir, '404', 'index.html'), join(staticDir, '404.html'));

await rm(quoteDir, { recursive: true, force: true });
await mkdir(quoteDir, { recursive: true });
await build({
  entryPoints: [join(root, 'src', 'api', 'quote.js')],
  bundle: true,
  platform: 'browser',
  format: 'esm',
  outfile: join(quoteDir, 'index.js'),
});

const pages = [
  '/', '/products', ...products.map((product) => `/products/${product.slug}`), '/cart', '/receipt', '/build', '/404',
].map((path) => ({
  filePath: path === '/build' || path === '/404' ? 'src/pages/Build.jsx' : 'src/main.jsx',
  urlPattern: path,
  mode: 'static',
  hasLoader: false,
  hasGetServerData: false,
  config: { mode: 'static', tags: path.startsWith('/products') ? ['cartograph-products'] : ['cartograph-shell'] },
}));

await writeFile(join(dist, 'manifest.json'), JSON.stringify({
  version: 1,
  pages,
  api: [
    {
      filePath: 'src/api/quote.js',
      urlPattern: '/api/quote',
      methods: ['POST'],
      kind: 'serverless',
      hasWebsocket: false,
      config: { kind: 'serverless', compute: { class: 'function', memory: '1gb' } },
    },
  ],
  timestamp: new Date().toISOString(),
}, null, 2));

await writeFile(join(dist, 'package.json'), `${JSON.stringify({ type: 'module', dependencies: { 'what-framework': '0.13.10' } }, null, 2)}\n`);
console.log(`Cartograph Vura build ready: ${pages.length} pages and /api/quote`);
