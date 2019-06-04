/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { LitElement, html } from '@polymer/lit-element';
import { store, connect } from '../../store';
import { givenItemSelector } from '../../reducers/shop';

// This element is *not* connected to the Redux store.
class GalleryListItem extends connect(store)(LitElement) {

  static get is() { return 'gallery-list-item'; }

  static get properties() { return {
    key: { type: String },
    item: { type: Object }
  }}

  render() {
    return html`
      <style>

        :host {
          --tile-bg: rgba(256, 0, 0, 0.6);
        }

        .tile {
          position: relative;
          max-height: inherit;
          overflow: hidden;
          height: 100%;
        }

        .tile__preview {
          max-height: inherit;
          height: 100%;
        }

        .tile__preview img {
          width: 100%;
          height: 100%;
          object-position: center ${this.item.display_position}%;
          object-fit: cover;

          position: relative;
        }

        .tile__minor {
          color: white;
          background-color: var(--tile-bg);
          opacity: 1.0;
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 50px;
          transition: transform 200ms;
          display: flex;
          align-items: center;
          font-size: 22px;
          padding-left: 1em;
        }

        .tile .tile__preview::after {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          border: 5px solid black;
        }

        .tile:hover .tile__preview::after {
          content: '';
        }

        .tile:hover .tile__minor {
          transform: translateY(50px);
        }

      </style>
      <div class="tile">
        <div class="tile__preview">
          <img src="/uploads/${this.item.preview}">
        </div>
        <header class="tile__minor">
          ${this.item.title}
        </header>
      </div>
    `;
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

window.customElements.define(GalleryListItem.is, GalleryListItem);
