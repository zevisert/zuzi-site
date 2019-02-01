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
import { store, connect } from '../../store';
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

        .minor {
          color: white;
          background-color: var(--tile-bg);
          opacity: 1.0;
          position: absolute;
          bottom: 0;
          right: 0;
          width: 100%;
          height: 50px;
          transition: transform 200ms;
          display: flex;
          align-items: center;
        }

        .minor span {
          margin-left: 1em;
          font-size: 22px;
        }

        .tile:hover .minor {
          transform: translateY(50px);
        }


      </style>
      <div class="tile">
        <div class="preview">
          <img src="/uploads/${this.item.preview}">
        </div>
        <header class="minor">
          <span>${this.item.title}</span>
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
