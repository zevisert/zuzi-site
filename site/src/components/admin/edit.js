/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { html } from "lit";
import { PageViewElement } from "../page-view-element.js";

// These are the shared styles needed by this element.
import { SharedStyles } from "../shared-styles.js";
import { ButtonSharedStyles } from "../button-shared-styles.js";
import { SharedDynamicTable } from "../dynamic-table-styles.js";

import { store, connect } from "../../store.js";
import { getAllProducts } from "../../actions/shop.js";
import { editItem, createItem } from "../../actions/admin.js";
import { selectedItemSelector } from "../../reducers/shop.js";

import { navigate } from "../../actions/app.js";

import "simple-chip";
import "../underline-input.js";
import "../toggle-input.js";
import "../donut.js";
import "./pricing-form.js";
import "./pricing-card.js";

const EMPTY_ITEM = {
  _id: null,
  preview: "",
  title: "",
  description: "",
  tags: [],
  pricings: [],
  active: false,
};

const JsonType = {
  fromAttribute: (attr) => {
    return JSON.parse(attr);
  },
  toAttribute: (prop) => {
    return JSON.stringify(prop);
  },
};

class AdminEdit extends connect(store)(PageViewElement) {
  static get is() {
    return "admin-edit";
  }

  static get properties() {
    return {
      item: { type: JsonType },
      __imageLoading: { type: Boolean },
      __uploadProgress: { type: String },
    };
  }

  constructor() {
    super();
    this.productKeys = new Set([]);
    this.__els = {};
    this.__tiff = null;
    this.__imageLoading = false;
    this.__uploadProgress = "Working...";

    this.item = {
      ...EMPTY_ITEM,
      pricings: [...EMPTY_ITEM.pricings],
      tags: [...EMPTY_ITEM.tags],
    };

    store.dispatch(getAllProducts());
  }

  render() {
    return html`
      ${SharedStyles} ${ButtonSharedStyles} ${SharedDynamicTable}

      <style>
        :host {
          --scroller-height: 600px;
        }

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

        .scroller-container {
          position: relative;
        }

        .canvas-scroller {
          position: relative;
          width: 1020px;
          height: var(--image-height, var(--scroller-height));
          max-height: var(--scroller-height);
          overflow-y: scroll;
        }

        .canvas-scroller canvas {
          position: absolute;
          width: 1000px;
          height: var(--image-height, var(--scroller-height));
        }

        .overlay {
          position: absolute;
          width: 1020px;
          height: var(--scroller-height);
          top: 0px;
        }

        .overlay {
          display: none;

          background-color: rgba(0, 0, 0, 0.7);
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .overlay[active] {
          display: flex;
        }

        .overlay span {
          color: white;
          font-size: larger;
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

        .breadcrumb {
          width: 1000px;
        }

        .breadcrumb a {
          color: black;
        }

        @media screen and (max-width: 725px) {
          #pricing-group table tbody tr td:nth-child(1):before {
            content: "Medium";
          }
          #pricing-group table tbody tr td:nth-child(2):before {
            content: "Size";
          }
          #pricing-group table tbody tr td:nth-child(3):before {
            content: "Price";
          }
          #pricing-group table tbody tr td:nth-child(4):before {
            content: "Remove";
          }
        }
      </style>
      <section>
        <div class="container">
          <h2 class="breadcrumb">
            <a href="/admin">Admin View</a> //
            ${this.item._id === null ? "New" : this.item.title}
          </h2>

          <input id="file" type="file" hidden />
          <div class="scroller-container">
            <div id="scroller" class="canvas-scroller">
              <canvas id="preview" @click="${() => this.__els.file.click()}"></canvas>
            </div>
            <div id="overlay" class="overlay" ?active=${this.__imageLoading}>
              <donut-spinner></donut-spinner>
              <span>${this.__uploadProgress}</span>
            </div>
          </div>

          <div class="form">
            <div class="form-info">
              <div>
                <div class="block">
                  <label for="title">Title</label>
                  <underline-input
                    id="title"
                    type="text"
                    placeholder="Title"
                    .value="${this.item.title}"
                  ></underline-input>
                </div>

                <div class="block">
                  <label for="desc">Description</label>
                  <underline-input
                    id="desc"
                    type="text"
                    placeholder="Description"
                    .value="${this.item.description}"
                  ></underline-input>
                </div>

                <div class="block">
                  <label for="tags">Tags</label>
                  <simple-chip
                    id="tags"
                    type="text"
                    placeholder="Tags"
                    commitkeycode="Space"
                  ></simple-chip>
                </div>

                <div class="block">
                  <label for="active">Active</label>
                  <toggle-input
                    id="active"
                    type="checkbox"
                    ?checked="${this.item.active}"
                  ></toggle-input>
                </div>

                <div
                  class="block"
                  ?hidden="${!(this.__els.file && this.__els.file.files[0])}"
                >
                  <label for="watermark">Watermark</label>
                  <toggle-input id="watermark" type="checkbox"></toggle-input>
                </div>
              </div>

              <button ?disabled="${this.__imageLoading}" @click="${this.submit}">
                ${this.item._id === null ? "Create Posting" : "Save Changes"}
              </button>
            </div>

            <div class="form-pricing">
              <div>
                <admin-pricing-form id="pricing"></admin-pricing-form>
              </div>
              <button
                ?disabled="${this.__imageLoading}"
                @click="${(e) => this.__els.pricing.broadcastPricing(e)}"
              >
                Add pricing
              </button>
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
                    ${this.item.pricings.map(
                      (pricing) => html` <tr>
                        <td class="column1">${pricing.medium}</td>
                        <td class="column2">
                          ${pricing.size.width}x${pricing.size.height}
                          ${pricing.size.unit}
                        </td>
                        <td class="column3">
                          ${pricing.available
                            ? html`<div class="pricing">$ ${pricing.price}</div>`
                            : html`<div class="pricing sold">Sold</div>`}
                        </td>
                        <td class="column4">
                          <button
                            ?disabled="${this.__imageLoading}"
                            @click="${(e) => {
                              e.stopPropagation();
                              this.pricingRemoved(pricing);
                            }}"
                          >
                            Remove
                          </button>
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
      this.reset();
      await this.updateComplete;

      const prevProducts = this.productKeys;
      this.productKeys = new Set(Object.keys(newState.shop.products));

      const [id, ...rest] = [...this.productKeys].filter(
        (key) => !prevProducts.has(key)
      );
      if (id && rest.length === 0) {
        // New item created
        store.dispatch(navigate(`/admin/${newState.shop.products[id].slug}`));
      }
    } else if (item) {
      this.item = item;
      this.__imageLoading = false;

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
      preview: this.renderRoot.getElementById("preview"),
      overlay: this.renderRoot.getElementById("overlay"),
      scroller: this.renderRoot.getElementById("scroller"),
      title: this.renderRoot.getElementById("title"),
      description: this.renderRoot.getElementById("desc"),
      tags: this.renderRoot.getElementById("tags"),
      active: this.renderRoot.getElementById("active"),
      pricing: this.renderRoot.getElementById("pricing"),
      file: this.renderRoot.getElementById("file"),
      watermark: this.renderRoot.getElementById("watermark"),
    };

    this.__els.file.addEventListener("change", this.readLocalImage.bind(this));

    this.__els.pricing.addEventListener(
      "admin-pricing-added",
      this.pricingAdded.bind(this)
    );
  }

  async reset() {
    this.item = { ...EMPTY_ITEM, pricings: [...EMPTY_ITEM.pricings] };
    this.__els.title.value = this.item.title;
    this.__els.description.value = this.item.description;
    this.__els.active.checked = this.item.active;

    this.__freeImage();
    const ctx = this.__els.preview.getContext("2d");
    ctx.clearRect(0, 0, this.__els.preview.width, this.__els.preview.height);

    this.renderRoot.host.style.removeProperty("--image-height");

    this.__imageLoading = false;
    this.__uploadProgress = "Working...";

    this.__els.file.value = "";
    if (!/safari/i.test(navigator.userAgent)) {
      this.__els.file.type = "";
      this.__els.file.type = "file";
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
      image: this.__els.file.files[0],
      display_position: this.display_position,
      should_watermark: this.__els.watermark.checked,
    };
    this.__imageLoading = true;
    const progressCallback = this.uploadProgress.bind(this);
    const doneCallback = this.uploadDone.bind(this);

    if (this.item._id === null) {
      store.dispatch(createItem(data, progressCallback, doneCallback));
    } else {
      store.dispatch(editItem(this.item.slug, data, progressCallback, doneCallback));
    }
  }

  pricingAdded(e) {
    const pricing = { ...e.detail.pricing, size: { ...e.detail.pricing.size } };
    const match = (p) => JSON.stringify(pricing) === JSON.stringify(p);
    if (this.item.pricings.filter(match).length === 0) {
      this.item.pricings.push(pricing);
      this.requestUpdate("item");
    }
  }

  pricingRemoved(pricing) {
    const drop = (p) => JSON.stringify(pricing) !== JSON.stringify(p);
    this.item.pricings = this.item.pricings.filter(drop);
    this.requestUpdate("item");
  }

  __freeImage() {
    if (
      this.__els.preview.dataset.src &&
      this.__els.preview.dataset.src.startsWith("blob")
    ) {
      URL.revokeObjectURL(this.__els.preview.dataset.src);
    }
  }

  uploadProgress(e) {
    if (e.lengthComputable) {
      this.__uploadProgress = `Uploading: (${Number((e.loaded / e.total) * 100).toFixed(
        0
      )} %)`;
    } else {
      this.__uploadProgress = "Working...";
    }
  }

  uploadDone() {
    this.__imageLoading = false;
    this.__uploadProgress = "Working...";
  }

  async readLocalImage() {
    const input = this.__els.file;

    // Is a file selected?
    if (input.files && input.files[0]) {
      // Try and free an existing blob
      this.__freeImage();

      // Setup loading indicators
      this.__imageLoading = true;
      this.__uploadProgress = "Working...";

      // Get file extension
      const [extension = ""] = /(?:\.([^.]+))?$/.exec(input.files[0].name);
      let blob = null;

      // Test for .tiff
      if ([".tiff", ".tif"].includes(extension.toLowerCase())) {
        await import("tiff.js");
        const buffer = await new Response(input.files[0]).arrayBuffer();

        Tiff.initialize({ TOTAL_MEMORY: 1e9 });
        const tiff = new Tiff({ buffer });
        const canvas = tiff.toCanvas();
        blob = await new Promise((resolve, reject) => {
          if (!canvas) {
            reject();
          }

          canvas.toBlob((blob) => {
            tiff.close();
            resolve(blob);
          });
        });
      } else {
        // Not .tiff, use response to blob
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

      this.renderRoot.host.style.setProperty(
        "--image-height",
        `${(1000 / img.width) * img.height}px`
      );

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      this.__imageLoading = false;

      this.display_position = this.item.display_position;
    };

    this.__els.preview.dataset.src = source;
    img.src = this.__els.preview.dataset.src;
  }

  get display_position() {
    const pos = Number(
      (100 * this.__els.scroller.scrollTop) /
        (+this.__els.scroller.scrollHeight - this.__els.scroller.clientHeight)
    );

    return Number.isNaN(pos) ? 50 : pos.toFixed(1);
  }

  set display_position(value) {
    const pos =
      (value / 100) *
      (+this.__els.scroller.scrollHeight - this.__els.scroller.clientHeight);

    this.__els.scroller.scrollTop = Number.isNaN(pos) ? 0 : pos.toFixed(1);
  }
}

window.customElements.define(AdminEdit.is, AdminEdit);
