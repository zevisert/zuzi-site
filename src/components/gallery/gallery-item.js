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
import { selectedItemSelector } from '../../reducers/shop';
import { getAllProducts, addToCart } from '../../actions/shop';
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

        button {
          border: 2px solid black;
          border-radius: 3px;
          padding: 8px 16px;
        }

        .container {
          display: flex;
          justify-content: space-between;
        }
      </style>

      <h2>${this.item.name}</h2>
      <img .src="${this.item ? `/uploads/${this.item.preview}`: ''}">
      <div class="container">
        <pre>$${this.item.price}</pre>
        <button @click="${() => store.dispatch(addToCart(this.item.id))}">Add to cart</button>
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

  stateChanged(state) {
    const [item, key] = selectedItemSelector(state);
    this.item = item;
  }
}

window.customElements.define('gallery-item', GalleryItem);
