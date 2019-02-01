/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html } from '@polymer/lit-element';
import { PageViewElement } from '../page-view-element.js';

// This element is connected to the Redux store.
import { store, connect } from '../../store.js';

import { CHECKOUT_STAGES_ENUM } from '../../actions/shop.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';


class Cart extends connect(store)(PageViewElement) {

  static get is() { return 'cart-view'; }

  static get properties() { return {
    __stage: { type: String },
  }}

  constructor() {
    super();
    this.__stage = CHECKOUT_STAGES_ENUM.CART;
  }

  __renderStage() {
    switch (this.__stage) {
      default:
      case CHECKOUT_STAGES_ENUM.CART:
        return ['Shopping Cart', html`
          <shop-cart></shop-cart>
        `];

      case CHECKOUT_STAGES_ENUM.PAYMENT_MODE:
        return ['Payment type', html`
          <shop-payment-select></shop-payment-select>
        `];

      case CHECKOUT_STAGES_ENUM.CHECKOUT:
        return ['Checkout', html`
          <shop-checkout>
            <slot name="stripe-card" slot="stripe-card"></slot>
          </shop-checkout>
        `];
    }
  }

  render() {
    const [title, subpage] = this.__renderStage();

    return html`
      ${SharedStyles}
      <style>
        section {
          margin: 0 auto;
          max-width: 1170px;
        }
      </style>
      <section>
        <h2>${title}</h2>
      </section>
      <section>
        ${subpage}
      </section>
    `;
  }

  async stateChanged(state) {
    this.__stage = state.shop.stage;

    switch (this.__stage) {
      default:
      case CHECKOUT_STAGES_ENUM.CART:
        await import('./shop-cart.js');
        break;

      case CHECKOUT_STAGES_ENUM.PAYMENT_MODE:
        await import('./shop-payment-select.js');
        break;

      case CHECKOUT_STAGES_ENUM.CHECKOUT:
        await import('./shop-checkout.js');
        break;
    }
  }
}

window.customElements.define(Cart.is, Cart);
