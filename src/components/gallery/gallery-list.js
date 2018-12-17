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
import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store } from '../../store.js';

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
          display: grid;
          grid-template-columns: 1fr;
          max-width: 1600px;
        }

        @media only screen and (min-width: 640px) {
          /* Medium layout - */
          :host {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media only screen and (min-width: 1280px) {
          /* Wide layout - */
          :host {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
      </style>

      ${Object.keys(this._products).map((key) => {
        const item = this._products[key];
        return html`
          <gallery-list-item
            .key="${item._id}"
            @click="${this._navigateToItem}">
          </gallery-list-item>
        `
      })}
    `;
  }

  static get properties() { return {
    _products: { type: Object }
  }}

  firstUpdated() {
    store.dispatch(getAllProducts());
  }

  _navigateToItem(e) {
    store.dispatch(navigate(`/gallery/${this._products[e.target.key].slug}`));
  }

  // This is called every time something is updated in the store.
  stateChanged(state) {
    this._products = state.shop.products;
  }
}

window.customElements.define('gallery-list', GalleryList);
