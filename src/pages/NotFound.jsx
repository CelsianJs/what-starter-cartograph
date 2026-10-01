import { Link } from 'what-framework/router';

export default function NotFound() {
  return (
    <section class="page-enter empty">
      <p class="eyebrow">404</p>
      <h1>The trail marker stops here.</h1>
      <p>Cartograph ships a real not-found document and a catch-all route for client navigation.</p>
      <Link class="button" href="/">Return to field desk</Link>
    </section>
  );
}
