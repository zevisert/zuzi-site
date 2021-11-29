/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { html } from "lit";
import { PageViewElement } from "../page-view-element";
import { store, connect } from "../../store.js";

import { getAllProducts } from "../../actions/shop";
import { selectedItemSelector } from "../../reducers/shop";

import { ButtonSharedStyles } from "../button-shared-styles";

import "../cart/pricing-grid";

// This element is *not* connected to the Redux store.
class GalleryItem extends connect(store)(PageViewElement) {
  static get is() {
    return "gallery-item";
  }

  static get properties() {
    return {
      item: { type: Object },
    };
  }

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
        <img .src="/uploads/${this.item.preview}" />
        <h2>${this.item.title}</h2>
        <p>${this.item.description}</p>

        <pricing-grid></pricing-grid>
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

  stateChanged(state) {
    const [item] = selectedItemSelector(state);
    this.item = item;
  }
}

window.customElements.define(GalleryItem.is, GalleryItem);
