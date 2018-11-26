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
import { store } from '../../store';
import { connect } from 'pwa-helpers/connect-mixin';
import { givenItemSelector } from '../../reducers/shop';

// This element is *not* connected to the Redux store.
class GalleryListItem extends connect(store)(LitElement) {
  render() {
    return html`
      <style>
        .card {
          box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
          transition: 0.3s;
          margin: 1em;
          max-height: 30vh;
        }

        .card:hover {
          box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
        }

        .card .img {
          overflow: hidden;
          max-height: calc(30vh - 2em);
        }
        
        .card .img img {
          width: 100%;
        }

        .container {
          padding: 2px 16px;
          display: flex;
          justify-content: space-between;
        }

        .container span {
          text-transform: capitalize;
        }

      </style>
      <div class="card">
        <div class="img">
          <img src="/uploads/${this.item.preview}">
        </div>
        <div class="container">
          <span>${this.item.name}</span>
          <span>$${this.item.price}</span>
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
      key: { type: Number }
    }
  }

  stateChanged(state) {
    this.item = givenItemSelector(this.key)(state);
  }
}

window.customElements.define('gallery-list-item', GalleryListItem);
