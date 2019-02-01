/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement, html } from '@polymer/lit-element';

// This element is connected to the Redux store.
import { store, connect } from '../../store.js';

// These are the elements needed by this element.
import './gallery-list-item.js';

// These are the actions needed by this element.
import { getAllProducts } from '../../actions/shop.js';

// These are the shared styles needed by this element.
import { ButtonSharedStyles } from '../button-shared-styles.js';
import { navigate } from '../../actions/app.js';

class GalleryList extends connect(store)(LitElement) {
  render() {
    return html`
      ${ButtonSharedStyles}
      <style>
        :host {

        }

        .tiles {
          display: grid;
          grid-template-columns: 1fr;
          max-width: 1600px;
        }

        .tiles gallery-list-item:nth-child(7n - 6) {
          --tile-bg: #6fc3dfE0;
        }

        .tiles gallery-list-item:nth-child(7n - 5) {
          --tile-bg: #8d82c4E0;
        }

        .tiles gallery-list-item:nth-child(7n - 4) {
          --tile-bg: #4db6acE0;
        }

        .tiles gallery-list-item:nth-child(7n - 3) {
          --tile-bg: #ec8d81E0;
        }

        .tiles gallery-list-item:nth-child(7n - 2) {
          --tile-bg: #e7b788E0;
        }

        .tiles gallery-list-item:nth-child(7n - 1) {
          --tile-bg: #8ea9e8E0;
        }

        .tiles gallery-list-item:nth-child(7n) {
          --tile-bg: #87c5a4E0;
        }

        @media only screen and (min-width: 640px) {
          /* Medium layout - */
          .tiles {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media only screen and (min-width: 1280px) {
          /* Wide layout - */
          .tiles {
            grid-template-columns: 1fr 1fr 1fr;
            margin: 0 auto;
          }
        }
      </style>

      <div class="tiles">
        ${this._filterIds.map((key) => {
          return html`
            <gallery-list-item
              .key="${key}"
              @click="${this._navigateToItem}">
            </gallery-list-item>
            `
        })}
      </div>
    `;
  }

  static get properties() { return {
    filter: { type: String },
    _filterIds: { type: Array },
    __allProducts: { type: Object }
  }}

  constructor() {
    super();
    this.filter = undefined;
    this._filterIds = [];
    this.__allProducts = {};
  }

  firstUpdated() {
    store.dispatch(getAllProducts());
  }

  updated(changedProperties) {
    if (changedProperties.has('filter') || changedProperties.has('__allProducts')) {
      this._filterIds = Object.values(this.__allProducts)
        .filter(item => this.filter.length == 0 || item.tags.includes(this.filter))
        .map(item => item._id);
    }
  }

  _navigateToItem(e) {
    store.dispatch(navigate(`/gallery/${this.__allProducts[e.target.key].slug}`));
  }

  stateChanged(state) {
    this.__allProducts = state.shop.products;
  }
}

window.customElements.define('gallery-list', GalleryList);
