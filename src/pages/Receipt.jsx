import { Link } from 'what-framework/router';
import { money } from '../data/products.js';
import { receipt, resetReceipt } from '../state/cart.js';

export default function Receipt() {
  return () => {
    const current = receipt();
    if (!current) {
      return (
        <section class="page-enter empty">
          <p class="eyebrow">Receipt</p>
          <h1>No local receipt yet.</h1>
          <p>Cartograph only writes a browser-local receipt after the quote endpoint accepts stock and totals.</p>
          <Link class="button" href="/cart">Go to cart</Link>
        </section>
      );
    }
    return (
      <section class="page-enter receipt-page">
        <div class="page-head">
          <p class="eyebrow">Local receipt</p>
          <h1>{current.quoteId}</h1>
          <p>No payment was collected. This receipt is stored in this browser only.</p>
        </div>
        <div class="receipt">
          {current.lines.map((line) => <p><span>{line.quantity} × {line.name}</span><strong>{money(line.lineTotal)}</strong></p>)}
          <hr />
          <p><span>Freight</span><strong>{money(current.shipping)}</strong></p>
          <p><span>Demo tax</span><strong>{money(current.tax)}</strong></p>
          <p class="total"><span>Total</span><strong>{money(current.total)}</strong></p>
        </div>
        <button class="button ghost" onClick={resetReceipt}>Reset receipt</button>
      </section>
    );
  };
}
