export const products = [
  {
    slug: 'basalt-frame-pack',
    name: 'Basalt Frame Pack',
    category: 'Carry',
    terrain: 'Alpine',
    price: 248,
    stock: 7,
    weight: '3.1 lb',
    material: 'Waxed nylon + ash stays',
    accent: '#f26b2b',
    summary: 'A clipped-frame pack for ridge pushes, rope teams, and thirty-hour weather windows.',
    details: ['Floating storm collar', 'Ice-tool lash grid', 'Removable brass repair kit'],
    glyph: 'pack',
  },
  {
    slug: 'moraine-shell',
    name: 'Moraine Shell',
    category: 'Layers',
    terrain: 'Storm',
    price: 318,
    stock: 4,
    weight: '18 oz',
    material: 'Three-layer ripstop',
    accent: '#8ca86f',
    summary: 'A quiet hard shell cut for map work, shoulder straps, and sideways rain.',
    details: ['Helmet-ready hood', 'Two-way pit vents', 'Field patch pocket'],
    glyph: 'shell',
  },
  {
    slug: 'signal-stove-kit',
    name: 'Signal Stove Kit',
    category: 'Camp',
    terrain: 'Bivouac',
    price: 132,
    stock: 11,
    weight: '14 oz',
    material: 'Anodized alloy',
    accent: '#d6aa53',
    summary: 'A nested stove kit with wind skirt, striker, and a pot sized for two tired climbers.',
    details: ['Cold-weather regulator', 'Nested cup and lid', 'Marked fuel gauge'],
    glyph: 'stove',
  },
  {
    slug: 'survey-tarp',
    name: 'Survey Tarp',
    category: 'Shelter',
    terrain: 'Forest',
    price: 176,
    stock: 5,
    weight: '1.4 lb',
    material: 'Silpoly gridcloth',
    accent: '#5f8f8b',
    summary: 'A taut, low-profile shelter for wet survey camps and fast shoulder-season routes.',
    details: ['Twelve reinforced tie-outs', 'Reflective guyline set', 'Packed pole sleeve'],
    glyph: 'tarp',
  },
  {
    slug: 'obsidian-bivy',
    name: 'Obsidian Bivy',
    category: 'Shelter',
    terrain: 'Alpine',
    price: 289,
    stock: 3,
    weight: '21 oz',
    material: 'Breathable laminate',
    accent: '#b75832',
    summary: 'A compact bivy for exposed ledges and unplanned nights below the summit block.',
    details: ['Hooped face vent', 'Storm flap zipper', 'Guyline crown loop'],
    glyph: 'bivy',
  },
  {
    slug: 'lumen-field-lantern',
    name: 'Lumen Field Lantern',
    category: 'Camp',
    terrain: 'Base',
    price: 86,
    stock: 15,
    weight: '9 oz',
    material: 'Frosted polycarbonate',
    accent: '#e9c46a',
    summary: 'A warm, repairable lantern for sorting gear without ruining night vision.',
    details: ['Red-map mode', 'USB-C reverse charge', 'Hangs flat or upright'],
    glyph: 'lantern',
  },
];

export const categories = ['All', ...new Set(products.map((product) => product.category))];
export const terrains = ['All', ...new Set(products.map((product) => product.terrain))];

export function findProduct(slug) {
  return products.find((product) => product.slug === slug);
}

export function money(centsOrDollars) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(centsOrDollars);
}
