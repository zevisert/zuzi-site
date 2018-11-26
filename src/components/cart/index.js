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
import { PageViewElement } from '../page-view-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store } from '../../store.js';

// These are the actions needed by this element.
import { checkout } from '../../actions/shop.js';

// We are lazy loading its reducer.
import shop, { cartQuantitySelector } from '../../reducers/shop.js';
store.addReducers({
  shop
});

// These are the elements needed by this element.
import './shop-cart.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';
import { ButtonSharedStyles } from '../button-shared-styles.js';

class Cart extends connect(store)(PageViewElement) {
  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      <style>
        button {
          border: 2px solid black;
          border-radius: 3px;
          padding: 8px 16px;
        }
      </style>

      <section>
        <h2>Shopping cart</h2>
      </section>

      <section>
        <h3>Your Cart</h3>
        <p>Number of items in the cart: <b>${this._quantity}</b></p>
        <shop-cart></shop-cart>

        <div>${this._error}</div>
        <p>
          <button ?hidden="${this._quantity == 0}" @click="${this._checkoutButtonClicked}">
            Checkout
          </button>
        </p>
      </section>
    `;
  }

  static get properties() { return {
    // This is the data from the store.
    _quantity: { type: Number },
    _error: { type: String },
  }}

  _checkoutButtonClicked() {
    store.dispatch(checkout());
  }

  // This is called every time something is updated in the store.
  stateChanged(state) {
    this._quantity = cartQuantitySelector(state);
    this._error = state.shop.error;
  }
}

window.customElements.define('cart-view', Cart);
