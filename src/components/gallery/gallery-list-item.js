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

        :host {
          --tile-bg: rgba(256, 0, 0, 0.6);
        }

        .tile {
          position: relative;
        }

        .tile .preview {
          overflow: hidden;
          max-height: calc(30vh - 2em);
        }

        .tile .preview img {
          width: 100%;
        }

        .major {
          position: absolute;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: opacity 200ms;
          background-color: var(--tile-bg);
        }

        .major h2 {
          padding-left: 40px;
        }

        .major h2::after {
          content: '';
          background-color: white;
          height: 2px;
          width: 100px;
          margin-top: 2em;
          display: block;
        }

        .major p {
          padding-left: 40px;
        }

        .tile:hover .major {
          opacity: 0;
        }

        .minor {
          color: white;
          background-color: var(--tile-bg);
          opacity: 0;
          position: absolute;
          bottom: 0;
          right: 0;
          width: 100%;
          transition: opacity 200ms;
        }

        .minor p {
          margin-left: 1em;
        }

        .tile:hover .minor {
          opacity: 1.0;
        }


      </style>
      <div class="tile">
        <div class="preview">
          <img src="/uploads/${this.item.preview}">
        </div>
        <header class="major">
          <h2>${this.item.title}</h2>
          <p>${this.item.description}</p>
        </header>

        <header class="minor">
          <p>${this.item.title}</p>
        </header>
      </div>
    `;
  }

  static get properties() {
    return {
      key: { type: String },
      item: { type: Object }
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('key')) {
      this.item = store.getState().shop.products[this.key];
    }
  }

  stateChanged(state) {
    this.item = givenItemSelector(this.key)(state);
  }
}

window.customElements.define('gallery-list-item', GalleryListItem);
