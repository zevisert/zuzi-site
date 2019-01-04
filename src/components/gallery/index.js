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
import { PageViewElement } from '../page-view-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store } from '../../store.js';

// These are the elements needed by this element.
import './gallery-list.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';
import { ButtonSharedStyles } from '../button-shared-styles.js';

class Gallery extends connect(store)(PageViewElement) {
  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      <style>

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
        <span class="filter-hint">Filter</span>
      </section>
      <section>
        <div class="tags">
          ${this.filter.length == 0
          ? this._tags.map(t => html`
              <span @click=${() => this.tagClicked(t)}>${t}</span>
            `)

          : html`<span @click=${() => this.tagClicked('')}>Clear</span>`
          }
        </div>
        <gallery-list filter=${this.filter}></gallery-list>
      </section>
    `;
  }

  static get properties() { return {
    _tags: { type: Array },
    filter: { type: String }
  }}

  constructor() {
    super();
    this.filter = '';
    this._tags = [];
  }

  tagClicked(tag) {
    this.filter = tag;
  }

  // This is called every time something is updated in the store.
  stateChanged(state) {
    const allTags = Object.values(state.shop.products).reduce((tags, item) => [... tags, ... item.tags], []);
    this._tags = [... (new Set(allTags)).keys()];
  }
}

window.customElements.define('gallery-view', Gallery);
