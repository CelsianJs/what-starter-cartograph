import { Link } from 'what-framework/router';
import { money } from '../data/products.js';
import { cartLines, cartSubtotal, quote, quoteStatus, requestQuote, setQuantity, writeReceipt } from '../state/cart.js';

export default function Cart() {
  return (
    <section class="page-enter">
      <div class="page-head">
        <p class="eyebrow">Basket ledger</p>
        <h1>Validate the kit before writing a local receipt.</h1>
        <p>Quantities live in What signals. The quote button posts a bounded payload to a Vura-shaped function and checks stock limits.</p>
      </div>
      {cartLines().length === 0 ? (
        <div class="empty"><h2>Your kit is empty.</h2><p>Pick a product before requesting a quote.</p><Link class="button" href="/products">Open products</Link></div>
      ) : (
        <div class="cart-layout">
          <div class="cart-lines">
            {cartLines().map(({ product, quantity }) => (
              <article class="cart-line">
                <div><h2>{product.name}</h2><p>{money(product.price)} / {product.stock} available</p></div>
                <label><span>Qty</span><input aria-label={`${product.name} quantity`} type="number" min="0" max="20" value={quantity} onInput={(event) => setQuantity(product.slug, event.target.value)} /></label>
                <strong>{money(product.price * quantity)}</strong>
              </article>
            ))}
          </div>
          <aside class="quote-panel" aria-live="polite">
            <p class="eyebrow">Serverless quote</p>
            <strong>{money(cartSubtotal())}</strong>
            <p>{quoteStatus()}</p>
            {quote()?.lines?.length ? <p>{quote().quoteId}: total {money(quote().total)} with freight and demo tax.</p> : null}
            <button class="button" onClick={() => requestQuote()}>Check field stock</button>
            <button class="button ghost" onClick={writeReceipt}>Write local receipt</button>
            <Link class="text-link" href="/receipt">View receipt</Link>
          </aside>
        </div>
      )}
    </section>
  );
}
