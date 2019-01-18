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
import { SharedDynamicTable } from '../dynamic-table-styles.js';

import { connect } from 'pwa-helpers/connect-mixin';
import { store } from '../../store.js';
import { getAllProducts } from '../../actions/shop.js';
import { editItem, createItem } from '../../actions/admin.js';
import { selectedItemSelector } from '../../reducers/shop.js';

import { navigate, showSnackbar } from '../../actions/app.js';

import 'simple-chip';
import '../underline-input.js';
import '../toggle-input.js';
import '../donut.js';
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

  static get is() { return 'admin-edit'; }
  static get properties() { return {
    item: { type: JsonType },
    __imageLoading: { type: Boolean }
  }}

  constructor() {
    super();
    this.productKeys = new Set([]);
    this.__els = {};
    this.__tiff = null;
    this.__imageLoading = false;

    this.item = { ... EMPTY_ITEM, pricings: [ ... EMPTY_ITEM.pricings ], tags: [ ... EMPTY_ITEM.tags ] };

    store.dispatch(getAllProducts());
  }

  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      ${SharedDynamicTable}

      <style>
        #preview {
          background-color: #efefef;
        }

        #tags {
          min-width: 195px;
          --chip-input-display: inline-block;
          --chip-input-border-bottom-height: 2px;
        }

        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .overlay {
          display: none;
        }

        .overlay[active] {
          position: absolute;
          background-color: rgba(0,0,0, 0.7);
          width: 1000px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form {
          display: flex;
          justify-content: space-evenly;
          padding-top: 3em;
        }

        .form-info,
        .form-pricing {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          margin: 0 3em;
          max-width: 500px;
        }

        label {
          display: inline-block;
          width: 100px;
          text-align: right;
        }

        .pricing-group {
          max-width: 1000px;
          margin: 0 auto;
          padding-top: 3em;
        }

        .table100-head {
          color: black;
          border: 2px solid black;
          font-weight: bold;
        }

        @media screen and (max-width: 725px) {
          #pricing-group table tbody tr td:nth-child(1):before { content: "Medium"; }
          #pricing-group table tbody tr td:nth-child(2):before { content: "Size"; }
          #pricing-group table tbody tr td:nth-child(3):before { content: "Price"; }
          #pricing-group table tbody tr td:nth-child(4):before { content: "Remove"; }

        }
      </style>
      <section>
        <h2><a href="/admin">Admin View</a> > ${this.item._id === null ? "New" : this.item.title}</h2>

        <input id="file" type="file" hidden>
        <div class="container">
          <div id="overlay" class="overlay" ?active=${this.__imageLoading}>
            <donut-spinner></donut-spinner>
          </div>
          <canvas id="preview" @click="${() => this.__els.file.click()}"></canvas>

          <div class="form">
            <div class="form-info">
              <div>
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
                  <toggle-input id="active" type="checkbox" ?checked="${this.item.active}">
                </div>
              </div>

              <button @click="${this.submit}">${this.item._id === null ? "Create Posting" : "Save Changes"}</button>
            </div>

            <div class="form-pricing">
              <div>
                <admin-pricing-form id="pricing"></admin-pricing-form>
              </div>
              <button @click="${e => this.__els.pricing.broadcastPricing(e) }">Add pricing</button>
            </div>
          </div>
        </div>

      </section>

      <section class="pricing-group">
        <div class="limiter">
          <div class="container-table100">
            <div class="wrap-table100">
              <div class="table100">
                <table>
                  <thead>
                    <tr class="table100-head">
                      <th class="column1">Medium</th>
                      <th class="column2">Size</th>
                      <th class="column3">Price</th>
                      <th class="column4">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.item.pricings.map(pricing => html`
                      <tr>
                        <td class="column1">${pricing.medium}</td>
                        <td class="column2">${pricing.size.width}x${pricing.size.height} ${pricing.size.unit}</td>
                        <td class="column3">
                          ${ pricing.available
                          ? html`<div class="pricing">$ ${pricing.price}</div>`
                          : html`<div class="pricing sold"> Sold </div>`
                          }
                        </td>
                        <td class="column4">
                          <button @click="${(e) => { e.stopPropagation(); this.pricingRemoved(pricing); }}">Remove</button>
                        </td>
                      </tr>`
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
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

      if (this.item.preview) {
        this.loadImage(`/uploads/${this.item.preview}`);
      }

      await this.__els.tags.updateComplete;
      this.__els.tags.clear();
      this.__els.tags.addChips(item.tags);
    }
  }


  firstUpdated() {
    this.__els = {
      preview: this.renderRoot.getElementById('preview'),
      overlay: this.renderRoot.getElementById('overlay'),
      title: this.renderRoot.getElementById('title'),
      description: this.renderRoot.getElementById('desc'),
      tags: this.renderRoot.getElementById('tags'),
      active: this.renderRoot.getElementById('active'),
      pricing: this.renderRoot.getElementById('pricing'),
      file: this.renderRoot.getElementById('file')
    };

    this.__els.file.addEventListener('change', this.readLocalImage.bind(this));

    this.__els.pricing.addEventListener('admin-pricing-added', this.pricingAdded.bind(this));

  }

  async reset() {
    this.item = { ... EMPTY_ITEM, pricings: [ ... EMPTY_ITEM.pricings ]};
    this.__els.title.value = this.item.title;
    this.__els.description.value = this.item.description
    this.__els.active.checked = this.item.active;

    this.__freeImage();
    const ctx = this.__els.preview.getContext('2d');
    ctx.clearRect(0, 0, this.__els.preview.width, this.__els.preview.height);
    this.__els.preview.width = 1000;
    this.__els.preview.height = 200;
    this.__els.cssText = ``;

    this.__els.file.value = '';
    if(!/safari/i.test(navigator.userAgent)) {
      this.__els.file.type = '';
      this.__els.file.type = 'file';
    }

    await this.__els.tags.updateComplete;
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
  }

  pricingAdded(e) {
    const pricing = { ...e.detail.pricing, size: { ... e.detail.pricing.size } };
    const match = p => JSON.stringify(pricing) === JSON.stringify(p);
    if (this.item.pricings.filter(match).length === 0) {
      this.item.pricings.push(pricing);
      this.requestUpdate('item');
    }
  }

  pricingRemoved(pricing) {
    const drop = p => JSON.stringify(pricing) !== JSON.stringify(p);
    this.item.pricings = this.item.pricings.filter(drop);
    this.requestUpdate('item');
  }

  __freeImage() {
    if (this.__els.preview.dataset.src && this.__els.preview.dataset.src.startsWith('blob')) {
      URL.revokeObjectURL(this.__els.preview.dataset.src);
    }
  }

  async readLocalImage() {
    const input = this.__els.file;

    if (input.files && input.files[0]) {

      this.__imageLoading = true;
      this.__els.overlay.style.height = `${this.__els.preview.style.height || this.__els.preview.height}px`;

      this.__freeImage();

      let blob;

      const extension = /(?:\.([^.]+))?$/.exec(input.files[0].name)[0];

      if ([".tiff", ".tif"].includes(extension.toLowerCase())) {
        const buffer = await new Response(input.files[0]).arrayBuffer();

        Tiff.initialize({ TOTAL_MEMORY: 1e9 });
        const tiff = new Tiff({ buffer });
        const canvas = tiff.toCanvas();
        blob = await new Promise((resolve, reject) => {
          if (! canvas) {
            reject();
          }

          canvas.toBlob(blob => {
            tiff.close();
            resolve(blob);
          });
        });

      } else {
        blob = await new Response(input.files[0]).blob();
      }

      this.loadImage(URL.createObjectURL(blob));
    }
  }

  loadImage(source) {
    const img = new Image();
    img.onload = () => {
      const canvas = this.__els.preview;

      canvas.width = img.width;
      canvas.height = img.height;
      canvas.style.cssText = `
        max-width: 1000px;
        height: ${(1000 / img.width) * img.height}px;
      `;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      this.__imageLoading = false;
    }

    this.__els.preview.dataset.src = source;
    img.src = this.__els.preview.dataset.src;
  }
}

window.customElements.define(AdminEdit.is, AdminEdit);
