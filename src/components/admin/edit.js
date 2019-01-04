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

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';
import { ButtonSharedStyles } from '../button-shared-styles.js';

import { connect } from 'pwa-helpers/connect-mixin';
import { store } from '../../store.js';
import { getAllProducts } from '../../actions/shop.js';
import { editItem, createItem } from '../../actions/admin.js';
import { selectedItemSelector } from '../../reducers/shop.js';

import { navigate, showSnackbar } from '../../actions/app.js';

import 'simple-chip';
import '../underline-input.js';
import './pricing-form.js';
import './pricing-card.js';

const EMPTY_ITEM = {
  _id: null,
  preview: '',
  title: '',
  description: '',
  tags: [],
  pricings: [],
  active: false,
};

const JsonType = {
  fromAttribute: (attr) => { return JSON.parse(attr) },
  toAttribute:   (prop) => { return JSON.stringify(prop) }
};

class AdminEdit extends connect(store)(PageViewElement) {

  static get properties() { return {
    item: { type: JsonType }
  }}

  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}

      <style>
        #preview {
          width: 100%;
          min-height: 20em;
          background-color: #efefef;
        }

        #tags {
          min-width: 195px;
          --chip-input-display: inline-block;
          --chip-input-border-bottom-height: 2px;
        }

        .container {
          display: grid;
          grid-template-columns: 400px 1fr;
        }

        .form {
          display: flex;
          flex-direction: column;
          justify-content: start;
          margin: 0 3em;
        }

        .pricing-group {
          display: grid;
          grid-gap: 1em;
          grid-template-columns: repeat(4, 1fr);
        }

        label {
          display: inline-block;
          width: 100px;
          text-align: right;
        }

        @media screen and (max-width: 725px) {
          .container {
            grid-template-columns: 1fr;
          }

          .pricing-group {
            grid-gap: 0.5em;
            grid-template-columns: repeat(2, 1fr);
          }
        }

      </style>
      <section>
        <h2><a href="/admin">Admin View</a> > ${this.item._id === null ? "New" : this.item.title}</h2>

        <div class="container">
          <img id="preview"
              @click="${() => this.__els.file.click()}"
              .src="${this.item.preview ? `/uploads/${this.item.preview}` : ''}"
          >
          <input id="file" type="file" hidden>
          <div class="form">
            <div class="block">
              <label for="title">Title</label>
              <underline-input id="title" type="text" placeholder="Title" .value="${this.item.title}">
            </div>

            <div class="block">
              <label for="desc">Description</label>
              <underline-input id="desc" type="text" placeholder="Description" .value="${this.item.description}">
            </div>

            <div class="block">
              <label for="tags">Tags</label>
              <simple-chip id="tags" type="text" placeholder="Tags" commitkeycode="Space">
            </div>

            <div class="block">
              <label for="active">Active</label>
              <input id="active" type="checkbox" ?checked="${this.item.active}">
            </div>

            <admin-pricing-form id="pricing"></admin-pricing-form>

            <div class="block">
              <button @click="${e => this.__els.pricing.broadcastPricing(e) }">Add pricing</button>
              <button @click="${this.submit}">${this.item._id === null ? "Create Posting" : "Save Changes"}</button>
            </div>
          </div>
        </div>

      </section>
      <section class="pricing-group">
        ${this.item.pricings.map(pricing => {
          return html`
            <admin-pricing-card
              pricing="${JSON.stringify(pricing)}"
              @admin-pricing-removed="${e => this.pricingRemoved(e)}"
            ></admin-pricing-card>
          `;
        })}
      </section>

    `;
  }

  async stateChanged(newState) {
    const [item, page] = selectedItemSelector(newState);

    // Let the element render once so we have element references
    await this.updateComplete;
    if (item === undefined && page === "new") {

      await this.reset();

      const prevProducts = this.productKeys;
      this.productKeys = new Set(Object.keys(newState.shop.products));

      const [id, ...rest] = [...this.productKeys].filter(key => ! prevProducts.has(key));
      if (id && rest.length === 0) {
        // New item created
        store.dispatch(navigate(`/admin/${newState.shop.products[id].slug}`));
      }
    } else if (item) {
      this.item = item;

      await this.__els.tags.updateComplete;
      this.__els.tags.clear();
      this.__els.tags.addChips(item.tags);
    }
  }

  constructor() {
    super();
    this.productKeys = new Set([]);

    this.item = { ... EMPTY_ITEM, pricings: [ ... EMPTY_ITEM.pricings ], tags: [ ... EMPTY_ITEM.tags ] };

    store.dispatch(getAllProducts());
  }

  firstUpdated() {
    this.__els = {
      preview: this.renderRoot.getElementById('preview'),
      title: this.renderRoot.getElementById('title'),
      description: this.renderRoot.getElementById('desc'),
      tags: this.renderRoot.getElementById('tags'),
      active: this.renderRoot.getElementById('active'),
      pricing: this.renderRoot.getElementById('pricing'),
      file: this.renderRoot.getElementById('file')
    };

    this.__els.file.addEventListener('change', this.readImage.bind(this));

    this.__els.pricing.addEventListener('admin-pricing-added', this.pricingAdded.bind(this));

  }

  async reset() {
    this.item = { ... EMPTY_ITEM, pricings: [ ... EMPTY_ITEM.pricings ]};
    this.__els.title.value = this.item.title;
    this.__els.description.value = this.item.description
    this.__els.active.checked = this.item.active;

    if (this.__els.preview.src.startsWith('blob')) {
      console.log('Released previous image');
      URL.revokeObjectURL(this.__els.preview.src);
    }
    this.__els.preview.src = this.item.preview;

    this.__els.file.value = '';
    if(!/safari/i.test(navigator.userAgent)) {
      this.__els.file.type = '';
      this.__els.file.type = 'file';
    }

    this.__els.tags.clear();

    return this.requestUpdate();
  }

  async submit() {

    const data = {
      title: this.__els.title.value,
      description: this.__els.description.value,
      tags: JSON.stringify(this.__els.tags.values),
      pricings: JSON.stringify(this.item.pricings),
      active: this.__els.active.checked,
      image: this.__els.file.files[0]
    };

    if (this.item._id === null) {
      store.dispatch(createItem(data));
    } else {
      store.dispatch(editItem(this.item.slug, data));
    }

    store.dispatch(showSnackbar('Item saved'));
  }

  pricingAdded(e) {
    const pricing = { ...e.detail.pricing, size: { ... e.detail.pricing.size } };
    const match = p => JSON.stringify(pricing) === JSON.stringify(p);
    if (this.item.pricings.filter(match).length === 0) {
      this.item.pricings.push(pricing);
      this.requestUpdate('item');
    }
  }

  pricingRemoved(e) {
    const drop = p => JSON.stringify(e.detail.pricing) !== JSON.stringify(p);
    this.item.pricings = this.item.pricings.filter(drop);
    this.requestUpdate('item');
  }

  async readImage(fileChangeEvent) {

    const input = this.__els.file;

    if (input.files && input.files[0]) {
      if (this.__els.preview.src.startsWith('blob')) {
        console.log('Released previous image');
        URL.revokeObjectURL(this.__els.preview.src);
      }

      const blob = await new Response(input.files[0]).blob();
      this.__els.preview.src = URL.createObjectURL(blob);
    }
  }
}

window.customElements.define('admin-edit', AdminEdit);
