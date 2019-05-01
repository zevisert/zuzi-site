/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html } from '@polymer/lit-element';
import { PageViewElement } from '../page-view-element.js';

// This element is connected to the Redux store.
import { store, connect } from '../../store.js';

// These are the elements needed by this element.
import './gallery-list.js';
import '../underline-input.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';
import { ButtonSharedStyles } from '../button-shared-styles.js';

import { createSubscriber } from '../../actions/app';

class Gallery extends connect(store)(PageViewElement) {

  static get is() { return 'gallery-view'; }

  static get properties() { return {
    _tags: { type: Array },
    filter: { type: String }
  }}

  constructor() {
    super();
    this.filter = '';
    this._tags = [];
  }

  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      <style>

      .filter {
        max-width: 1600px;
        margin: 0 auto;
      }

      .tags,
      .filter-hint {
        display: flex;
        justify-content: flex-end;
      }

      .filter-hint {
        font-size: small;
        font-style: oblique;
        opacity: 0.5;
        padding: 0 1em;
      }

      .tags span {
        padding: 0 1rem;
        transition: opacity 0.2s;
      }

      .tags span:not(:last-child) {
        border-right: 2px solid #d2d5e4;
      }

      .tags:hover span:not(:hover) {
        opacity: 0.5;
      }

      </style>
      <section>
        <underline-input id="email" type="email" placeholder="Email"></underline-input>
        <button @click=${this.signup}>Subscribe to new posts</button>
      </section>
      <section class="filter">
        <span class="filter-hint">Filter by</span>
        <div class="tags">
          ${this.filter.length == 0
          ? this._tags.map(t => html`
              <span @click=${() => this.tagClicked(t)}>${t}</span>
            `)

          : html`<span @click=${() => this.tagClicked('')}>Clear</span>`
          }
        </div>
      </section>
      <section>
        <gallery-list filter=${this.filter}></gallery-list>
      </section>
    `;
  }

  tagClicked(tag) {
    this.filter = tag;
  }

  // This is called every time something is updated in the store.
  stateChanged(state) {
    const allTags = Object.values(state.shop.products).reduce((tags, item) => [... tags, ... item.tags], []);
    this._tags = [... (new Set(allTags)).keys()];
  }

  signup() {
    store.dispatch(createSubscriber(this.renderRoot.getElementById('email').value))
  }
}

window.customElements.define(Gallery.is, Gallery);
