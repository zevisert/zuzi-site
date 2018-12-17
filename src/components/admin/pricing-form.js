import { html, LitElement } from '@polymer/lit-element';
import { InputTextNumber, InputUnderline } from '../input-styles';
import { ButtonSharedStyles } from '../button-shared-styles';


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
    ${InputTextNumber}
    ${InputUnderline}
    ${ButtonSharedStyles}
    <style>
      label {
        display: inline-block;
        width: 100px;
        text-align: right;
      }

      button {
        border: 2px solid gray;
        border-radius: 3px;
        padding: 8px 16px;
      }
    </style> 
    <div class="block">
      <label for="price">Price</label>
      <div class="underline">
        <input id="price" type="number" placeholder="Price"
          @input="${e => this._onChange('price', e)}"
          .value="${this.pricing.price}"
        >
      </div>
    </div>

    <div class="block">
      <label for="width">Width</label>
      <div class="underline">
        <input id="width" type="number" placeholder="Width"
          @input="${e => this._onChange('width', e)}"
          .value="${this.pricing.size.width}"
        >
      </div>
    </div>

    <div class="block">
      <label for="height">Height</label>
      <div class="underline">
        <input id="height" type="number" placeholder="Height"
          @input="${e => this._onChange('height', e)}"
          .value="${this.pricing.size.height}"
        >
      </div>
    </div>

    <div class="block">
      <label for="medium">Medium</label>
      <div class="underline">
        <input id="medium" type="text" placeholder="Medium"
          @input="${e => this._onChange('medium', e)}"
          .value="${this.pricing.medium}"
        >
      </div>
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

    Object.values(this.__els).forEach(el => {
      el.addEventListener('focus', this.focusUp.bind(this));
      el.addEventListener('blur', this.focusUp.bind(this));
    });
  }

  _onChange(name, e) {
    if (['width', 'height'].includes(name)) {
      this.pricing.size[name] = e.path[0].value;
    } else {
      this.pricing[name] = e.path[0].value;
    }
  }

  focusUp(e) {
    if (e.type === "focus") {
      e.target.parentNode.classList.add('focus');
    } else if (e.type === "blur") {
      e.target.parentNode.classList.remove('focus');
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