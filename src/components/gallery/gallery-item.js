/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html } from '@polymer/lit-element';
import { PageViewElement } from '../page-view-element';
import { store, connect } from "../../store.js";

import { getAllProducts, addToCart } from '../../actions/shop';
import { showSnackbar } from '../../actions/app';
import { selectedItemSelector } from '../../reducers/shop';

import { ButtonSharedStyles } from '../button-shared-styles';


// This element is *not* connected to the Redux store.
class GalleryItem extends connect(store)(PageViewElement) {

  static get is() { return 'gallery-item'; }

  static get properties() { return {
      item: { type: Object }
  }}

  render() {
    return html`
      ${ButtonSharedStyles}
      <style>
        section {
          float: right;
          margin-bottom: 2px;
        }

        img {
          width: 100%;
        }

        .item {
          max-width: 1000px;
        }

        .item h2,
        .item p {
          text-align: end;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }

        .card {
          display: flex;
          flex-direction: column;

          padding: 5px;
          box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
          transition: 0.3s;
          margin: 1em;
          max-height: 30vh;
        }

        .card .medium {
          font-size: large;
        }

        .card .pricing {
          font: monospace;
        }

        .card button {
          align-self: center;
        }

        /* Medium layout */
        @media (min-width: 620px) {
          .item {
            margin: 0 auto;
          }
        }

      </style>
      <section>
        <a href="/gallery"><button>Return to Gallery</button></a>
      </section>
      <article class="item">
        <img .src="/uploads/${this.item.preview}">
        <h2>${this.item.title}</h2>
        <p>${this.item.description}</p>

        <div class="pricing-grid">
          ${this.item.pricings.map(pricing => html`
            <div class="card">
              <div class="medium">${pricing.medium}</div>
              ${ pricing.available
              ? html`<div class="pricing">$ ${pricing.price}</div>`
              : html`<div class="pricing sold"> Sold </div>`
              }
              <div class="sizing">${pricing.size.width}x${pricing.size.height} ${pricing.size.unit}</div>

              ${ pricing.available
              ? html`<button @click="${() => this._addToCart(this.item._id, pricing)}">Add to cart</button>`
              : html`<button disabled>Sold out</button>`
              }

            </div>
          `)}
        </div>
      </article>
    `;
  }

  shouldUpdate() {
    return !!this.item;
  }

  connectedCallback() {
    super.connectedCallback();
    store.dispatch(getAllProducts());
  }

  _addToCart(id, pricing){
    store.dispatch(showSnackbar("Added to cart"));
    store.dispatch(addToCart(id, pricing));
  }

  stateChanged(state) {
    const [item, key] = selectedItemSelector(state);
    this.item = item;
  }
}

window.customElements.define(GalleryItem.is, GalleryItem);
