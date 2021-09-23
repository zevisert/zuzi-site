/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { LitElement, html } from 'lit';

// This element is connected to the Redux store.
import { store, connect } from '../../store.js';

// These are the elements needed by this element.
import '../gallery/gallery-list-item.js';

// These are the actions needed by this element.
import { advanceCheckout } from '../../actions/shop.js';

// These are the reducers needed by this element.
import { cartItemsSelector, cartTotalSelector, cartQuantitySelector } from '../../reducers/shop.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';
import { ButtonSharedStyles } from '../button-shared-styles.js';

import './shop-cart-item.js';
import { SharedDynamicTable } from '../dynamic-table-styles.js';

class ShopCart extends connect(store)(LitElement) {

  static get is() { return 'shop-cart'; }

  static get properties() { return {
    _items: { type: Array },
    _total: { type: Number }
  }}

  render() {
    return html`
      ${ButtonSharedStyles}
      ${SharedStyles}
      ${SharedDynamicTable}

      <style>
        :host {
          display: block;
          width: 100%;
        }

        shop-cart-item:not(:last-child)::after {
          content: "";
          height: 3px;
          display: block;
        }

      </style>

      <p ?hidden="${this._items.length !== 0}">You can add artwork and prints to your cart using when viewing individual artwork in the gallery.</p>

      <article>
        ${this._items.map((item) =>
          html`
            <shop-cart-item
              .preview="${item.preview}"
              .label="${item.label}"
              .amount="${item.amount}"
              .price="${item.price}"
              .key="${item.key}"
            ></shop-cart-item>
          `
        )}
      </article>

      <p>Number of items in the cart: <b>${this._quantity}</b></p>
      <p ?hidden="${!this._items.length}"><b>Total:</b> $ ${this._total.toFixed(2)}</p>

      <button ?hidden="${this._quantity == 0}" @click="${this._paymentButtonClicked}">
        Proceed to Payment Selection
      </button>
    `;
  }

  _paymentButtonClicked() {
    store.dispatch(advanceCheckout());
  }

  // This is called every time something is updated in the store.
  stateChanged(state) {
    this._items = cartItemsSelector(state);
    this._quantity = cartQuantitySelector(state);
    this._total = cartTotalSelector(state);
  }
}

window.customElements.define(ShopCart.is, ShopCart);
