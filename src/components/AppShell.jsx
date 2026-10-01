import { Link } from 'what-framework/router';
import { cartCount, storageNotice } from '../state/cart.js';

const nav = [
  ['/', 'Field desk'],
  ['/products', 'Products'],
  ['/cart', 'Cart'],
  ['/receipt', 'Receipt'],
  ['/build', 'Build'],
];

export default function AppShell({ children }) {
  return (
    <div class="shell">
      <a class="skip-link" href="#content">Skip to content</a>
      <header class="topbar">
        <Link class="brand" href="/">Cartograph</Link>
        <nav aria-label="Primary">
          {nav.map(([href, label]) => <Link href={href} activeClass="active" exactActiveClass="active">{label}</Link>)}
        </nav>
        <Link class="cart-chip" href="/cart">{cartCount()} in kit</Link>
      </header>
      <div class="save-strip" role="status">{storageNotice()}</div>
      <main id="content">{children}</main>
      <footer>
        <p>Cartograph uses bundled stock fixtures and a local receipt. It does not collect payment or reserve inventory.</p>
      </footer>
    </div>
  );
}
