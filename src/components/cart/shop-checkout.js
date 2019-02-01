/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html, LitElement } from '@polymer/lit-element';
import { store, connect } from '../../store.js';


// These are the actions needed by this element.
import { checkoutEtransfer, checkoutStripe, checkoutFailed, CHECKOUT_METHODS_ENUM, setCheckoutStage, retreatCheckout, CHECKOUT_STAGES_ENUM } from '../../actions/shop.js';
import { cartTotalSelector, cartQuantitySelector } from '../../reducers/shop.js';

import { ButtonSharedStyles } from '../button-shared-styles.js';
import { SharedStyles } from '../shared-styles.js';

import '../underline-input.js';

export class ShopCheckout extends connect(store)(LitElement) {

  static get is() { return 'shop-checkout'; }

  static get properties() { return {
    _items: { type: Array },
    _totalCents: { type: Number },
    _quantity: { type: Number },
    _paymentMethod: { type: Number }
  }}

  constructor() {
    super();
    this._paymentMethod = null;
  }

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

        label {
          width: 195px;
          display: inline-block;
          text-align: left;
          vertical-align: top;
          line-height: 35px;
        }

        #cust-ship-addr {
          width: 395px;
        }

        #payment-method,
        #address-group {
          display: inline-block;
        }

        section article:last-of-type {
          padding-top: 2em;
        }

        .checkout-group {
          display: flex;
          justify-content: center;
          flex-direction: column;
          margin-top: 3em;
        }

        .checkout-group button {
          margin: 0 auto;
          min-width: 200px;
        }

        .retreat-checkout {
          border: none;
          margin-bottom: 1em;
        }

        .retreat-checkout div {
          display: flex;
          justify-content: center;
          align-items: center;
        }

      </style>
      <section>
        <article>
          <label for="cust-name">Name</label>
          <underline-input
            type="text"
            id="cust-name"
            placeholder="Name${this._paymentMethod === CHECKOUT_METHODS_ENUM.STRIPE ? ' on card' : ''}">
          </underline-input>
        </article>

        <article>
          <label for="cust-email">Email Address</label>
          <underline-input
            type="email"
            id="cust-email"
            placeholder="Contact Email">
          </underline-input>
        </article>

        <article>
          <label for="address-group">Shipping Information</label>
          <div id="address-group">
            <div>
              <underline-input type="text"  id="cust-ship-addr"    placeholder="Shipping Address"></underline-input>
            </div>
            <div>
              <underline-input type="text"  id="cust-ship-city"    placeholder="City"></underline-input>
              <underline-input type="text"  id="cust-ship-postal"  placeholder="Postal Code"></underline-input>
            </div>
            <div>
              <underline-input type="text"  id="cust-ship-prov"    placeholder="Province"></underline-input>
              <underline-input type="text"  id="cust-ship-country" placeholder="Country"></underline-input>
            </div>
          </div>
        </article>

        <section>
          <article>
            <label for="payment-method">Payment</label>
            ${this._paymentMethod === CHECKOUT_METHODS_ENUM.STRIPE ?
              html`
                <div id="payment-method" class="card-mount">
                  <slot name="stripe-card"> </slot>
                </div>`
            : html`
                <p id="payment-method">
                  Continue with Interac E-Transfer. Instructions will be emailed to you.<br>
                  Your order will be confirmed when the E-Transfer is completed.
                </p>
            `}
          </article>
        </section>

        <section class="checkout-group">

          <button class="retreat-checkout" @click="${this._checkoutBackButtonClicked}">
            <div><mwc-icon>keyboard_backspace</mwc-icon> Payment Type</div>
          </button>

          <button ?hidden="${this._quantity == 0}" @click="${this._checkoutButtonClicked}">
            Checkout
          </button>

        </section>
      </section>
    `;
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

    if (this._paymentMethod === CHECKOUT_METHODS_ENUM.STRIPE) {

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
  }

  _checkoutBackButtonClicked() {
    store.dispatch(retreatCheckout());
  }

  _checkoutButtonClicked() {
    const { ok, metadata } = this._validateInput();

    if (ok) {
      if (this._paymentMethod === CHECKOUT_METHODS_ENUM.STRIPE) {
        store.dispatch(checkoutStripe(this.cardElement, {
          amount: this._totalCents,
          metadata
        }));
      } else if (this._paymentMethod === CHECKOUT_METHODS_ENUM.ETRANSFER) {
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
    const isEmail = value => !!value && (new RegExp([
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))/,
      /@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ].map(part => part.source).join(''))).test(value);

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
    this._paymentMethod = state.shop.method;
    this.__stage = state.shop.stage;
  }
}

customElements.define(ShopCheckout.is, ShopCheckout);
