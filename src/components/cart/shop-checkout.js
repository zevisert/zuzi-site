import { html, LitElement } from '@polymer/lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../../store.js';


// These are the actions needed by this element.
import { checkoutEtransfer, checkoutStripe, checkoutFailed } from '../../actions/shop.js';
import { cartTotalSelector, cartQuantitySelector } from '../../reducers/shop.js';

import { ButtonSharedStyles } from '../button-shared-styles.js';
import { SharedStyles } from '../shared-styles.js';

import '../underline-input.js';

export class ShopCheckout extends connect(store)(LitElement) {
  static get is() { return 'shop-checkout' }

  render() {
    return html`
      ${ButtonSharedStyles}
      ${SharedStyles}
      <style>
        .card-mount ::slotted(*) {
          width: 300px;
          padding: 10px;
          box-shadow: 0 0 3px 0px rgba(0,0,0,0.1);
        }
      </style>
      <section>
        <underline-input type="text"  id="cust-name"         placeholder="Name${this._paymentMethod === "stripe" ? ' on card' : ''}"></underline-input>
        <underline-input type="email" id="cust-email"        placeholder="Contact Email"></underline-input>
        <underline-input type="text"  id="cust-ship-addr"    placeholder="Shipping Address"></underline-input>
        <underline-input type="text"  id="cust-ship-city"    placeholder="City"></underline-input>
        <underline-input type="text"  id="cust-ship-prov"    placeholder="Province"></underline-input>
        <underline-input type="text"  id="cust-ship-country" placeholder="Country"></underline-input>
        <underline-input type="text"  id="cust-ship-postal"  placeholder="Postal Code"></underline-input>

        <section>
          <h3>Payment Method</h3>
          <div>
            <input type="radio"
              name="payment-method"
              value="stripe"
              checked
              @change="${e => this._radioChange(e)}"
              >
            <label for="stripe">By with card</label>
          </div>

          <div>
            <input type="radio"
              name="payment-method"
              value="etransfer"
              @change="${e => this._radioChange(e)}"
            >
            <label for="etransfer">Interac E-Transfer</label>
          </div>

          ${this._paymentMethod === "stripe" ?
            html`
              <div class="card-mount">
                <slot name="stripe-card"> </slot>
              </div>`
          : html`
              <section>
                Continue with Interac E-Transfer. Instructions will be emailed to you.
                Your order will be confirmed when the E-Transfer is completed.
              </section>
          `}

        </section>
        <button ?hidden="${this._quantity == 0}" @click="${this._checkoutButtonClicked}">
          Checkout
        </button>
      </section>
    `;
  }

  static get properties() { return {
    _items: { type: Array },
    _totalCents: { type: Number },
    _quantity: { type: Number },
    _paymentMethod: { type: String }
  }}

  constructor() {
    super();
    this._paymentMethod = 'stripe';
  }

  firstUpdated() {

    this.__els = {
      // Card mount must be in light-dom
      cardMount: document.getElementById('stripe-card-mount'),

      customer: {
        name: this.renderRoot.getElementById('cust-name'),
        email: this.renderRoot.getElementById('cust-email'),
        shipping: {
          address: this.renderRoot.getElementById('cust-ship-addr'),
          locality: this.renderRoot.getElementById('cust-ship-city'),
          region: this.renderRoot.getElementById('cust-ship-prov'),
          country: this.renderRoot.getElementById('cust-ship-country'),
          postal_code: this.renderRoot.getElementById('cust-ship-postal'),
        }
      }
    };

    if (! process.stripe) {
      process.stripe = Stripe(process.env.STRIPE_PK, {
        betas: ['payment_intent_beta_3']
      });
    }

    const stripe = process.stripe;
    const elements = stripe.elements();

    // Create an instance of the card Element.
    this.cardElement = elements.create('card');
    this.cardElement.mount(this.__els.cardMount);
  }

  _radioChange(e) {
    this._paymentMethod = e.target.value;
  }

  _checkoutButtonClicked() {

    const { ok, metadata } = this._validateInput();

    if (ok) {
      if (this._paymentMethod === 'stripe') {
        store.dispatch(checkoutStripe(this.cardElement, {
          amount: this._totalCents,
          metadata
        }));
      } else if (this._paymentMethod === 'etransfer') {
        store.dispatch(checkoutEtransfer({
          amount: this._totalCents,
          metadata
        }));
      } else {
        store.dispatch(checkoutFailed('Sorry. Unknown payment type.'));
      }
    } else {
      store.dispatch(checkoutFailed('Please review the input fields in red'));
    }
  }

  _validateInput() {

    const isText = value => !!value && /^(?![\s.]+$)[a-zA-Z0-9\s.]+$/.test(value);
    const isEmail = value => !!value && /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);

    const methods = {
      'customer.name': isText,
      'customer.email': isEmail,
      'customer.shipping.address': isText,
      'customer.shipping.postal_code': isText,
      'customer.shipping.locality': isText,
      'customer.shipping.region': isText,
      'customer.shipping.country': isText
    };

    let ok = true;
    for (const [path, method] of Object.entries(methods)) {
      const parts = path.split('.');
      let field = this.__els;

      for (const part of parts) {
        field = field[part];
      }

      if (! method(field.value)) {
        ok = false;
        field.error = true;
      } else {
        field.error = false;
      }
    }

    if (!ok) {
      return { ok, metadata: null };
    }

    const items = Object.values(this._items).map(cartItem => { return {
      quantity: cartItem.quantity,
      postId: cartItem.productId,
      pricingId: cartItem.pricing._id
    } });

    return { ok, metadata: {
      items,
      customer: {
        name: this.__els.customer.name.value,
        email: this.__els.customer.email.value,
        shipping: {
          address_lines: [ this.__els.customer.shipping.address.value ],
          postal_code: this.__els.customer.shipping.postal_code.value,
          locality: this.__els.customer.shipping.locality.value,
          region: this.__els.customer.shipping.region.value,
          country: this.__els.customer.shipping.country.value
        }
      },
      info: null
    }};
  }

  stateChanged(state) {
    this._items = state.shop.cart;
    this._totalCents = parseInt(100 * cartTotalSelector(state));
    this._quantity = cartQuantitySelector(state);
  }
}

customElements.define(ShopCheckout.is, ShopCheckout);
