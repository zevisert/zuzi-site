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
import { getAllProducts, deleteItem, editItem } from '../../actions/shop.js';
import { selectedItemSelector } from '../../reducers/shop.js';

class AdminView extends connect(store)(PageViewElement) {
  render() {
    return html`
      ${SharedStyles}
        
      <style>
        img {
          width: 100%;
        }

        button {
          border: 2px solid black;
          border-radius: 3px;
          padding: 8px 16px;
        }

        .container {
          display: flex;
          justify-content: space-between;
        }
      </style>
      <section>
        <h2>Admin View</h2>
    
        <h3>${this.item.title}</h3>
        <img src="/uploads/${this.item.preview}">
        <div class="container">
            <input id="title" type="text" placeholder="Title" value="${this.item.title}">
            <input id="desc" type="text" placeholder="Description" value="${this.item.description}">
            <input id="price" type="number" placeholder="Price" value="${this.item.price}">
            <input id="sizes" type="text" placeholder="Sizes" value="${this.trimSizes()}">
            <input id="inven" type="number" placeholder="Inventory" value="${this.item.inventory}">
            <input id="active" type="checkbox" ?checked="${this.item.active}">
            <input id="file" type="file">
        </div>
        <button @click="${this.editItem}">Submit changes</button>
      </section>
    `
  }

  shouldUpdate() {
      return !!this.item;
  }

  stateChanged(newState) {
    this.item = selectedItemSelector(newState);
  }

  static get properties() {
    return {
      item: Object
    }
  }

  constructor() {
    super();
    store.dispatch(getAllProducts());
  }

  trimSizes() {
    return JSON.stringify(this.item.sizes.map(s => {
        return {
            width: s.width,
            height: s.height
        }
    }));
  }

  async editItem() {
    const data = {
      title: this.shadowRoot.getElementById('title').value,
      description: this.shadowRoot.getElementById('desc').value,
      price: this.shadowRoot.getElementById('price').value,
      sizes: this.shadowRoot.getElementById('sizes').value,
      inventory: this.shadowRoot.getElementById('inven').value,
      active: this.shadowRoot.getElementById('active').checked,
      image: this.shadowRoot.getElementById('file').files[0]
    };

    store.dispatch(editItem(this.item.id, data));
  }

  async deleteItem(id) {
    store.dispatch(deleteItem(id));
  }
}

window.customElements.define('admin-edit', AdminView);
