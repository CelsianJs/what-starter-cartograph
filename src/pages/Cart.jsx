import { Link } from 'what-framework/router';
import { money } from '../data/products.js';
import { cart, cartLines, cartSubtotal, quote, quoteStatus, requestQuote, setQuantity, writeReceipt } from '../state/cart.js';

function parseQuantity(value) {
  if (!/^\d+$/.test(value)) return null;
  const next = Number(value);
  if (!Number.isSafeInteger(next) || next < 1 || next > 20) return null;
  return next;
}

function updateQuantity(slug, value, quantity) {
  const parsed = parseQuantity(value);
  if (parsed && parsed !== quantity) setQuantity(slug, parsed);
}

function commitQuantity(event, slug, quantity) {
  const parsed = parseQuantity(event.currentTarget.value);
  if (parsed) setQuantity(slug, parsed);
  else event.currentTarget.value = String(quantity);
}

function CartLine({ product }) {
  const quantity = () => cart()[product.slug] || 0;
  return (
    <article class="cart-line" key={product.slug}>
      <div><h2>{product.name}</h2><p>{money(product.price)} / {product.stock} available</p></div>
      <div class="quantity-editor">
        <label>
          <span>Qty</span>
          <input
            aria-label={`${product.name} quantity`}
            aria-describedby={`${product.slug}-quantity-help`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            defaultValue={quantity()}
            onInput={(event) => updateQuantity(product.slug, event.target.value, quantity())}
            onChange={(event) => updateQuantity(product.slug, event.target.value, quantity())}
            onBlur={(event) => commitQuantity(event, product.slug, quantity())}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }
            }}
          />
        </label>
        <small id={`${product.slug}-quantity-help`}>Enter 1–20. Blank edits keep the current kit line until blur.</small>
        <button class="link-button" onClick={() => setQuantity(product.slug, 0)}>Remove</button>
      </div>
      <strong>{money(product.price * quantity())}</strong>
    </article>
  );
}

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
            {cartLines().map(({ product }) => <CartLine key={product.slug} product={product} />)}
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
