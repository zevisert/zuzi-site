/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { html, LitElement } from "lit";
import { ButtonSharedStyles } from "../button-shared-styles";

import "../underline-input";
import "../toggle-input";

const JsonType = {
  fromAttribute: (attr) => {
    return JSON.parse(attr);
  },
  toAttribute: (prop) => {
    return JSON.stringify(prop);
  },
};

export class AdminPricingForm extends LitElement {
  static get is() {
    return "admin-pricing-form";
  }

  static get properties() {
    return {
      pricing: { type: JsonType },
    };
  }

  constructor() {
    super();

    this.pricing = {
      price: null,
      available: true,
      medium: "",
      size: {
        width: null,
        height: null,
        unit: "in",
      },
    };

    // Non-properties
    this.__els = null;
  }

  render() {
    return html`
      ${ButtonSharedStyles}
      <style>
        label {
          display: inline-block;
          width: 100px;
          text-align: right;
        }
      </style>
      <div class="block">
        <label for="price">Price</label>
        <underline-input
          id="price"
          type="number"
          placeholder="Price"
          @input="${(e) => this._onChange("price", e)}"
          .value="${this.pricing.price}"
        ></underline-input>
      </div>

      <div class="block">
        <label for="width">Width</label>
        <underline-input
          id="width"
          type="number"
          placeholder="Width"
          @input="${(e) => this._onChange("width", e)}"
          .value="${this.pricing.size.width}"
        ></underline-input>
      </div>

      <div class="block">
        <label for="height">Height</label>
        <underline-input
          id="height"
          type="number"
          placeholder="Height"
          @input="${(e) => this._onChange("height", e)}"
          .value="${this.pricing.size.height}"
        ></underline-input>
      </div>

      <div class="block">
        <label for="medium">Medium</label>
        <underline-input
          id="medium"
          type="text"
          placeholder="Medium"
          @input="${(e) => this._onChange("medium", e)}"
          .value="${this.pricing.medium}"
        ></underline-input>
      </div>

      <div class="block">
        <label for="available">Available</label>
        <toggle-input
          id="available"
          type="checkbox"
          @changed="${(e) => this._onChange("available", e)}"
          .checked="${this.pricing.available}"
        ></toggle-input>
      </div>
    `;
  }

  firstUpdated() {
    this.__els = {
      price: this.renderRoot.getElementById("price"),
      medium: this.renderRoot.getElementById("medium"),
      width: this.renderRoot.getElementById("width"),
      height: this.renderRoot.getElementById("height"),
      available: this.renderRoot.getElementById("available"),
    };
  }

  _onChange(name, e) {
    switch (name) {
      case "width":
      case "height":
        this.pricing.size[name] = e.target.value;
        break;

      case "available":
        this.pricing[name] = e.target.checked;
        break;

      case "price":
      case "medium":
        this.pricing[name] = e.target.value;
        break;

      default:
        throw new Error(`Pricing change for bad key ${name}`);
    }
  }

  broadcastPricing() {
    this.dispatchEvent(
      new CustomEvent("admin-pricing-added", {
        detail: {
          pricing: this.pricing,
        },
      })
    );

    this.reset();
  }

  async reset() {
    [this.__els.price, this.__els.medium, this.__els.width, this.__els.height].map(
      (el) => {
        el.value = "";
      }
    );

    this.__els.available.checked = true;

    this.pricing = {
      price: null,
      available: true,
      medium: null,
      size: {
        width: null,
        height: null,
        unit: "in",
      },
    };

    return this.updateComplete;
  }
}

customElements.define(AdminPricingForm.is, AdminPricingForm);
