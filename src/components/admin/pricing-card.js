import { html, LitElement } from '@polymer/lit-element';
import { ButtonSharedStyles } from '../button-shared-styles';


const JsonType = {
  fromAttribute: (attr) => { return JSON.parse(attr) },
  toAttribute:   (prop) => { return JSON.stringify(prop) }
};

export class AdminPricingCard extends LitElement {

  static get is() { return 'admin-pricing-card'; }
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
        unit: 'inch'
      },
      medium: null
    };
  }

  render() {
    return html `
      ${ButtonSharedStyles}
      <style>
      .card {
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: 0.3s;
        margin: 1em;
        max-height: 30vh;
      }
      </style>
      <div class="card">
        <div>$ ${this.pricing.price}</div>
        <div>${this.pricing.medium}</div>
        <div>${this.pricing.size.width}x${this.pricing.size.height} ${this.pricing.size.unit}</div>

        <button @click="${e => this._removePricing(e) }">Remove pricing</button>
      </div>
    `;
  }

  _removePricing(e) {
    this.dispatchEvent(
      new CustomEvent('admin-pricing-removed', {
        detail: {
          pricing: this.pricing
        }
      })
    );
  }
}

 customElements.define(AdminPricingCard.is, AdminPricingCard);
