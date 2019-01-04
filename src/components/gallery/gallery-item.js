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
import { connect } from 'pwa-helpers/connect-mixin';
import { PageViewElement } from '../page-view-element';
import { store } from "../../store.js";

import { getAllProducts, addToCart } from '../../actions/shop';
import { showSnackbar } from '../../actions/app';
import { selectedItemSelector } from '../../reducers/shop';

import { ButtonSharedStyles } from '../button-shared-styles';


// This element is *not* connected to the Redux store.
class GalleryItem extends connect(store)(PageViewElement) {
  render() {
    return html`
      ${ButtonSharedStyles}
      <style>
        img {
          width: 100%;
        }

        .item {
          max-width: 600px;
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

        @media (min-width: 640px) {
          .item {
            margin: 0 auto;
          }
        }

      </style>

      <div class="item">
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
      </div>
    `;
  }

  constructor() {
    super();
  }

  shouldUpdate() {
    return !!this.item;
  }

  static get properties() {
    return {
      item: Object
    }
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

window.customElements.define('gallery-item', GalleryItem);
