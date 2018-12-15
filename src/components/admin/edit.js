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
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from '../../store.js';
import { getAllProducts, editItem, createItem } from '../../actions/shop.js';
import { selectedItemSelector } from '../../reducers/shop.js';

import { navigate } from '../../actions/app.js';

const EMPTY_ITEM = {
  id: null,
  preview: '',
  title: '',
  description: '',
  pricing: [ {
    price: null,
    medium: '',
    size: {
      width: null, 
      height: null
    }
  } ],
  active: false,
};

class AdminEdit extends connect(store)(PageViewElement) {

  static get properties() { return {
    item: EMPTY_ITEM
  }}

  render() {
    return html`
      ${SharedStyles}
        
      <style>
        img {
          width: 100%;
          background-color: #efefef;
        }

        button {
          border: 2px solid black;
          border-radius: 3px;
          padding: 8px 16px;
        }

        .container {
          display: grid;
          grid-template-columns: 600px 1fr;
        }

        .form {
          display: flex;
          flex-direction: column;
          justify-content: start;
          margin: 0 3em;
        }

        label {
          display: inline-block;
          width: 100px;
          text-align: right;
        }

        input[type="text"],
        input[type="number"] {
          font-size: 16px;
          line-height: 2rem;
          border: 0;
          background: none;
          outline: none;
        }

        .underline {
          display: inline-block;
          position: relative;
        }

        .underline::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 1px;
          bottom: 0;
          left: 0;
          background-color: lightgray;
        }

        .underline::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 1px;
          bottom: 0;
          left: 0;
          background-color: darkcyan;
          transform-origin: bottom right;
          transition: transform 0.25s ease-in;
        }

        .underline.focus::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }

      </style>
      <section>
        <h2><a href="/admin">Admin View</a> > ${this.item.id === null ? "New" : this.item.title}</h2>
    
        <div class="container">
          <img id="preview" .src="${this.item.preview ? `/uploads/${this.item.preview}` : ''}">
          <div class="form">
            <div class="block">
              <label for="title">Title</label>
              <div class="underline">
                <input id="title" type="text" placeholder="Title" .value="${this.item.title}">
              </div>
            </div>

            <div class="block">
              <label for="desc">Description</label>
              <div class="underline">
                <input id="desc" type="text" placeholder="Description" .value="${this.item.description}">
              </div>
            </div>

            <div class="block">
              <label for="price">Price</label>
              <div class="underline">
                <input id="price" type="number" placeholder="Price" .value="${this.item.pricing[0].price}">
              </div>
            </div>

            <div class="block">
              <label for="width">Width</label>
              <div class="underline">
                <input id="width" type="number" placeholder="Width" .value="${this.item.pricing[0].size.width}">
              </div>
            </div>

            <div class="block">
              <label for="height">Height</label>
              <div class="underline">
                <input id="height" type="number" placeholder="Height" .value="${this.item.pricing[0].size.height}">
              </div>
            </div>

            <div class="block">
              <label for="medium">Medium</label>
              <div class="underline">
                <input id="medium" type="text" placeholder="Medium" .value="${this.item.pricing[0].medium}">
              </div>
            </div>

            <div class="block">
              <label for="active">Active</label>
              <input id="active" type="checkbox" ?checked="${this.item.active}">
            </div>

            <div class="block">
              <button id="file-button" @click="${() => this.elements.file.click()}">Change File</button>
              <input id="file" type="file" hidden>
            </div>
          </div>
        </div>
        <button @click="${this.submit}">${this.item.id === null ? "Create Posting" : "Save Changes"}</button>
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
    }
  }

  constructor() {
    super();
    this.productKeys = new Set([]); 

    this.item = EMPTY_ITEM;

    store.dispatch(getAllProducts());
  }

  firstUpdated() {
    this.elements = {
      preview: this.renderRoot.getElementById('preview'),
      title: this.renderRoot.getElementById('title'),
      description: this.renderRoot.getElementById('desc'),
      price: this.renderRoot.getElementById('price'),
      medium: this.renderRoot.getElementById('medium'),
      active: this.renderRoot.getElementById('active'),
      width: this.renderRoot.getElementById('width'),
      height: this.renderRoot.getElementById('height'),
      file: this.renderRoot.getElementById('file'),
      fileButton: this.renderRoot.getElementById('file-button')
    };

    this.elements.file.addEventListener('change', this.readImage.bind(this));

    [ this.elements.title,
      this.elements.description,
      this.elements.price,
      this.elements.width,
      this.elements.height,
      this.elements.medium
    ].forEach(elem => {
      elem.addEventListener('focus', this.focusUp.bind(this));
      elem.addEventListener('blur', this.focusUp.bind(this));
    });
  }

  async reset() {
    this.item = EMPTY_ITEM;
    this.elements.title.value = this.item.title;
    this.elements.description.value = this.item.description
    this.elements.price.value = this.item.pricing[0].price;
    this.elements.medium.value = this.item.pricing[0].medium;
    this.elements.width.value = this.item.pricing[0].size.width;
    this.elements.height.value = this.item.pricing[0].size.height;
    this.elements.active.checked = this.item.active;

    if (this.elements.preview.src.startsWith('blob')) {
      console.log('Released previous image');
      URL.revokeObjectURL(this.elements.preview.src);
    }
    this.elements.preview.src = this.item.preview;
    
    this.elements.fileButton.innerText = 'Change File';
    
    this.elements.file.value = '';
    if(!/safari/i.test(navigator.userAgent)) {
      this.elements.file.type = '';
      this.elements.file.type = 'file';
    }

    return this.requestUpdate();
  }

  async submit() {

    const data = {
      title: this.elements.title.value,
      description: this.elements.description.value,
      pricing: JSON.stringify([ {
        price: parseFloat(this.elements.price.value),
        size: {
          width: this.elements.width.value,
          height: this.elements.height.value,
        },
        medium: this.elements.medium.value
      } ]),       
      active: this.elements.active.checked,
      image: this.elements.file.files[0]
    };

    console.log(data);

    if (this.item.id === null) {      
      store.dispatch(createItem(data));
    } else {
      store.dispatch(editItem(this.item.id, data));
    }
  }

  async readImage(fileChangeEvent) {
    
    this.elements.fileButton.innerText = fileChangeEvent.target.files[0].name;
    const input = this.elements.file;

    if (input.files && input.files[0]) {
      if (this.elements.preview.src.startsWith('blob')) {
        console.log('Released previous image');
        URL.revokeObjectURL(this.elements.preview.src);
      }

      const blob = await new Response(input.files[0]).blob();
      this.elements.preview.src = URL.createObjectURL(blob);
    }
  }

  focusUp(e) {
    if (e.type === "focus") {
      e.target.parentNode.classList.add('focus');
    } else if (e.type === "blur") {
      e.target.parentNode.classList.remove('focus');
    }
  }
}

window.customElements.define('admin-edit', AdminEdit);
