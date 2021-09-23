import { LitElement, html } from 'lit';

import { showSnackbar } from '../../actions/app';
import { connect, store } from '../../store'
import { selectedItemSelector } from "../../reducers/shop";

import "@material/mwc-icon"
import { ButtonSharedStyles } from "../button-shared-styles";
import { addToCart } from "../../actions/shop";


export class PricingGrid extends connect(store)(LitElement) {
  static get is() { return 'pricing-grid' }
  static get properties() { return {
    pricings: { type: Array },
    basket:   { type: Map }
  }}

  constructor() {
    super();
    this.basket = new Map();
  }

  render() {
    return html`
    ${ButtonSharedStyles}
    <style>
      :host {
        user-select: none;
        display: grid;
        grid-template-areas:  "header  header"
                              "table   table"
                              "summary summary";
        grid-template-columns: 3fr    1fr;
      }

      header   { grid-area: header; }
      .table   { grid-area: table; }
      .summary {
        grid-area: summary;
        display: flex;
        flex-direction: column-reverse;
        padding-left: 10px;
        padding-top: 20px;
      }

      .row {
        display: grid;
        border-top: 1px solid black;
        grid-template-areas:   "decrement increment medium price"
                               "decrement increment desc   price";
        grid-template-columns: 40px       40px      1fr    100px;
      }

      .medium {
        grid-area: medium;
        font-size: large;
      }

      .pricing {
        grid-area: price;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding-right: 10px;
      }

      .sizing {
        grid-area: desc;
        font-style: italic;
      }

      .increment, .decrement {
        display: flex;
        align-items: center;
        justify-content: center;
        color: gray;
      }

      .increment:hover,
      .decrement:hover {
        color: black;
      }

      .increment { grid-area: increment; }
      .decrement { grid-area: decrement; }

      .basket {
        display: flex;
        justify-content: space-between;
      }

      .total { }

      .tally {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      /* Column layout */
      @media only screen and (min-width: 970px) {
        :host {
          grid-template-areas:  "header header"
                                "table  summary";
        }
      }

    </style>
    <header>
      ${(() => {
        if (this.pricings.length > 0) {
          return "Purchasing options"
        } else {
          return "This item is not for sale"
        }
      })()}
    </header>
    <div class="table">
      ${this.pricings.map(pricing => html`
        <div class="row">
          <div class="medium">${pricing.medium}</div>
          ${(() => {
            if (pricing.available) {
              return html`
                <div class="pricing">$ ${pricing.price}</div>
                <mwc-icon class="increment" @click=${() => this._incrementItem(pricing)}>add_circle_outline</mwc-icon>
                <mwc-icon class="decrement" @click=${() => this._decrementItem(pricing)}>remove_circle_outline</mwc-icon>
              `
            } else {
              return html`
                <div class="pricing">Sold out!</div>
              `
            }
          })()}
          <div class="sizing">${pricing.size.width}x${pricing.size.height} ${pricing.size.unit}</div>
        </div>`
      )}
    </div>
    <div class="summary">
      <div class="tally">
        <div class="total">Total: $${[...this.basket.entries()].reduce((total, [pricing, count]) => total + pricing.price * count, 0)}</div>
        <button class="add" @click="${this._addToCart}" ?disabled="${[...this.basket.values()].every(val => val === 0)}">Add to cart</button>
      </div>
      ${[...this.basket.entries()].filter(([_, count]) => count > 0).map(([pricing, count]) => html`
        <div class="basket"><div>${pricing.medium}</div> <div>x${count}</div></div>
      `)}
    </div>
    `
  }

  _incrementItem(pricing) {
    this.basket.set(pricing, this.basket.get(pricing) + 1)
    this.requestUpdate()
  }

  _decrementItem(pricing) {
    this.basket.set(pricing, Math.max(0, this.basket.get(pricing) - 1))
    this.requestUpdate()
  }

  _addToCart() {
    const clonedBasket = [...this.basket.entries()]
    for (const [pricing, count] of clonedBasket) {
      if (count > 0) {
        store.dispatch(addToCart(this.productId, pricing, count));
      }
    }

    store.dispatch(showSnackbar("Added to cart"));

  }

  stateChanged(state) {
    const [item] = selectedItemSelector(state)
    if (item) {
      this.productId = item._id
      this.pricings = item.pricings
      this.basket.clear();

      for (const pricing of this.pricings) {
        this.basket.set(pricing, 0);
      }

      this.requestUpdate();
    }
  }
}

customElements.define(PricingGrid.is, PricingGrid)
