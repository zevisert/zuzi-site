import { html, LitElement } from '@polymer/lit-element';
import { ButtonSharedStyles } from '../button-shared-styles';

import '../underline-input';

const JsonType = {
  fromAttribute: (attr) => { return JSON.parse(attr) },
  toAttribute:   (prop) => { return JSON.stringify(prop) }
};

export class AdminPricingForm extends LitElement {

  static get is() { return 'admin-pricing-form'; }
  static get properties() {
    return {
      pricing: { type: JsonType }
    };
  }

  constructor() {
    super();

    this.pricing = {
      price: null,
      size: {
        width: null,
        height: null,
        unit: 'in'
      },
      medium: null
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
      <underline-input id="price" type="number" placeholder="Price"
        @input="${e => this._onChange('price', e)}"
        .value="${this.pricing.price}"
      >
    </div>

    <div class="block">
      <label for="width">Width</label>
      <underline-input id="width" type="number" placeholder="Width"
        @input="${e => this._onChange('width', e)}"
        .value="${this.pricing.size.width}"
      >
    </div>

    <div class="block">
      <label for="height">Height</label>
      <underline-input id="height" type="number" placeholder="Height"
        @input="${e => this._onChange('height', e)}"
        .value="${this.pricing.size.height}"
      >
    </div>

    <div class="block">
      <label for="medium">Medium</label>
      <underline-input id="medium" type="text" placeholder="Medium"
        @input="${e => this._onChange('medium', e)}"
        .value="${this.pricing.medium}"
      >
    </div>
    `;
  }

  firstUpdated() {
    this.__els = {
      price: this.renderRoot.getElementById('price'),
      medium: this.renderRoot.getElementById('medium'),
      width: this.renderRoot.getElementById('width'),
      height: this.renderRoot.getElementById('height'),
    };
  }

  _onChange(name, e) {
    if (['width', 'height'].includes(name)) {
      this.pricing.size[name] = e.path[0].value;
    } else {
      this.pricing[name] = e.path[0].value;
    }
  }

  broadcastPricing(e) {
    this.dispatchEvent(
      new CustomEvent('admin-pricing-added', {
        detail: {
          pricing: this.pricing
        }
      })
    );

    for (const el of Object.values(this.__els)) {
      el.value = '';
    }
  }
}

customElements.define(AdminPricingForm.is, AdminPricingForm);
