/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { LitElement, html } from "lit";
import { ButtonSharedStyles } from "../button-shared-styles";
import { store } from "../../store.js";

import { showSnackbar } from "../../actions/app.js";
import { removeFromCart } from "../../actions/shop.js";

import "@material/mwc-icon";

// This element is *not* connected to the Redux store.
class ShopItem extends LitElement {
  static get is() {
    return "shop-cart-item";
  }

  static get properties() {
    return {
      key: { type: String },
      item: { type: Object, attribute: false },
      pricing: { type: Object, attribute: false },
      quantity: { type: Number, attribute: false },
    };
  }

  constructor() {
    super();
    this.key = null;
    this.item = null;
    this.pricing = null;
  }

  render() {
    return html`
      ${ButtonSharedStyles}
      <style>
        .self {
          background-color: #f0f0f0;
          padding: 1em;
        }

        .preview {
          max-width: 200px;
          max-height: 200px;

          border: 1px solid black;
          padding: 1em;
          margin-right: 2em;
          flex: 0 0 auto;
          align-self: center;
        }

        .context h2 {
          margin-top: 0px;
        }

        .context label {
          width: 5em;
          display: inline-block;
          color: #616161;
        }

        .self {
          display: grid;
          grid-template-columns: 300px 1fr;
          position: relative;
        }

        .remove {
          position: absolute;
          padding: 1em;
          cursor: pointer;
          right: 0;
          top: 0;
        }
      </style>

      <div class="self">
        <img src="/uploads/${this.item.preview}" class="preview" />
        <div class="context">
          <h2>${this.item.title}</h2>
          <div><label>Medium:</label>${this.pricing.medium}</div>
          <div>
            <label>Size:</label>${this.pricing.size.width}${this.pricing.size.unit} by
            ${this.pricing.size.height}${this.pricing.size.unit}
          </div>
          <div><label>Price:</label>$ ${this.pricing.price.toFixed(2)}</div>
          <div><label>Quantity:</label>${this.quantity}</div>
          <div class="remove" @click="${this._removeButtonClicked}">
            <mwc-icon>close</mwc-icon>
          </div>
        </div>
      </div>
    `;
  }

  _removeButtonClicked() {
    store.dispatch(showSnackbar("Removed from cart"));
    store.dispatch(removeFromCart(this.key));
  }

  shouldUpdate() {
    const [itemID, pricingID] = this.key.split("-");

    if (itemID !== undefined && pricingID !== undefined) {
      const state = store.getState();
      this.item = state.shop.products[itemID];
      this.pricing = this.item.pricings.find((pricing) => pricing._id === pricingID);
      this.quantity = state.shop.cart[this.key].quantity;

      return true;
    } else {
      return false;
    }
  }
}

window.customElements.define(ShopItem.is, ShopItem);
