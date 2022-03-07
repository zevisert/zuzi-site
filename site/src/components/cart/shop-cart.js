/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { LitElement, html } from "lit";

// This element is connected to the Redux store.
import { store, connect } from "../../store.js";

// These are the elements needed by this element.
import "../gallery/gallery-list-item.js";

// These are the actions needed by this element.
import { advanceCheckout } from "../../actions/shop.js";

// These are the reducers needed by this element.
import {
  cartItemsSelector,
  cartTotalSelector,
  cartQuantitySelector,
} from "../../reducers/shop.js";

// These are the shared styles needed by this element.
import { SharedStyles } from "../shared-styles.js";
import { ButtonSharedStyles } from "../button-shared-styles.js";

import "./shop-cart-item.js";
import { SharedDynamicTable } from "../dynamic-table-styles.js";

class ShopCart extends connect(store)(LitElement) {
  static get is() {
    return "shop-cart";
  }

  static get properties() {
    return {
      _items: { type: Array },
      _total: { type: Number },
    };
  }

  render() {
    return html`
      ${ButtonSharedStyles} ${SharedStyles} ${SharedDynamicTable}

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

      <p>
        We're working to bring you a new checkout experience. In the mean time, please
        <a href="mailto:zuzi-@hotmail.com">email me directly (zuzi-@hotmail.com)</a>
        if you want to purchase some artwork!
      </p>

      <article>
        ${this._items.map(
          (item) =>
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

      <p ?hidden="${!this._items.length}"><b>Total:</b> $ ${this._total.toFixed(2)}</p>

      <button ?hidden="${this._quantity == 0}" @click="${this._paymentButtonClicked}">
        Email me
      </button>
    `;
  }

  _paymentButtonClicked() {
    const params = new URLSearchParams({
      subject: "I'd like to buy some art!",
      body: `I'm interested in ${this._items.map((item) => item.label).join(", ")}.`,
    }).toString();
    var mail = document.createElement("a");
    mail.href = `mailto:zuzi-@hotmail.com?${params}`;
    mail.target = "_blank";
    mail.click();
  }

  // This is called every time something is updated in the store.
  stateChanged(state) {
    this._items = cartItemsSelector(state);
    this._quantity = cartQuantitySelector(state);
    this._total = cartTotalSelector(state);
  }
}

window.customElements.define(ShopCart.is, ShopCart);
