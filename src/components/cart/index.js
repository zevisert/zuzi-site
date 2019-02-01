/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html } from '@polymer/lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { PageViewElement } from '../page-view-element.js';

// This element is connected to the Redux store.
import { store } from '../../store.js';

// We are lazy loading its reducer.
import shop from '../../reducers/shop.js';
store.addReducers({
  shop
});

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
