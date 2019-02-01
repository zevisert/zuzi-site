/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html, LitElement } from '@polymer/lit-element';
import { store, connect } from '../../store.js';

import { ButtonSharedStyles } from '../button-shared-styles.js';
import { SharedStyles } from '../shared-styles.js';
import {
  advanceCheckout,
  retreatCheckout,
  setCheckoutMethod,
  CHECKOUT_METHODS_ENUM
} from '../../actions/shop.js';

export class ShopPayment extends connect(store)(LitElement) {

  static get is() { return 'shop-payment-select'; }

  render() {
    return html`
      ${ButtonSharedStyles}
      ${SharedStyles}
      <style>
        .radio-group {
          display: flex;
          flex-flow: row wrap;
        }

        .radio-group > div {
          flex: 1;
          padding: 0.5rem;
          position: relative;
        }

        input[type="radio"] {
          display: none;
        }

        input[type="radio"]:not(:disabled) ~ label {
          cursor: pointer;
        }

        input[type="radio"]:disabled ~ label {
          color: gray;
          border-color: gray;
          box-shadow: none;
          cursor: not-allowed;
        }

        input[type="radio"] + label {
          height: 100%;
          display: block;
          background: white;
          border: 2px solid black;
          text-align: center;
          position: relative;
          user-select: none;
        }

        input[type="radio"]:checked + label {
          color: black;
          border-color: mediumseagreen;
        }

        input[type="radio"]:not(:checked) ~ mwc-icon {
          display: none;
        }

        input[type="radio"]:checked ~ mwc-icon {
          display: initial;
          color: mediumseagreen;
          border: 2px solid mediumseagreen;
          font-size: 30px;
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          height: 50px;
          width: 50px;
          line-height: 50px;
          text-align: center;
          border-radius: 50%;
          background: white;
        }

        @media only screen and (max-width: 700px) {
          .radio-group {
            flex-direction: column;
          }
        }

        .advance-button {
          display: flex;
          justify-content: center;
          flex-direction: column;
          margin-top: 3em;
        }

        .advance-button button {
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

      <section class="radio-group">
        <div>
          <input type="radio"  name="payment-method" checked
            id="stripe"
            value="${CHECKOUT_METHODS_ENUM.STRIPE}"
            @change="${e => this._radioChange(e)}"
          >
          <label for="stripe">
            <h2>Pay by Card</h2>
            <p>Visa, Mastercard, American Express</p>
          </label>
          <mwc-icon>check</mwc-icon>
        </div>
        <div>
          <input type="radio" name="payment-method"
            id="etransfer"
            value="${CHECKOUT_METHODS_ENUM.ETRANSFER}"
            @change="${e => this._radioChange(e)}"
          >
          <label for="etransfer">
            <h2>Interac E-transfer</h2>
            <p>Your order will stay in a pending state until an E-transfer is accepted</p>
          </label>
          <mwc-icon>check</mwc-icon>
        </div>
        <div>
          <input type="radio" name="payment-method" disabled
            id="paypal"
            value="${-1}"
            @change="${e => this._radioChange(e)}"
          >
          <label for="paypal">
            <h2>PayPal</h2>
            <p>Coming Soon</p>
          </label>
          <mwc-icon>close</mwc-icon>
        </div>
      </section>

      <section class="advance-button">

        <button class="retreat-checkout" @click="${this._checkoutBackButtonClicked}">
          <div><mwc-icon>keyboard_backspace</mwc-icon> Modify cart</div>
        </button>

        <button ?hidden="${this._quantity == 0}" @click="${this._checkoutButtonClicked}">
          Proceed to Checkout
        </button>

      </section>
    `;
  }

  _radioChange(e) {
    store.dispatch(setCheckoutMethod(Number(e.target.value)));
  }

  _checkoutBackButtonClicked() {
    store.dispatch(retreatCheckout());
  }

  _checkoutButtonClicked() {
    store.dispatch(advanceCheckout());
  }
}

customElements.define(ShopPayment.is, ShopPayment);
