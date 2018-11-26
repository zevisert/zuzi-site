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
import { getAllProducts, deleteItem, createItem } from '../../actions/shop.js';
import { ButtonSharedStyles } from '../button-shared-styles.js';

class AdminView extends connect(store)(PageViewElement) {
  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      <style>
        td img {
          max-width: 40px;
        }
        tr {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
        }
      </style>
      <section>
        <h2>Admin View</h2>
        
        <table>
          <tr>
            <th>Preview</th>
            <th>ID</th> 
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Sizes</th>
            <th>Inventory</th>
            <th>Active</th>
            <th>Delete</th> 
          </tr>
          ${Object.values(this._postings).map(post => 
            html`<tr>
              <td><img src="/uploads/${post.preview}"></td>
              <td>${post.id}</td>
              <td>${post.title}</td>
              <td>${post.description}</td>
              <td>${post.price}</td>
              <td>${post.sizes}</td>
              <td>${post.inventory}</td>
              <td>${post.active}</td>
              <td><button @click="${() => this.deleteItem(post.id)}">Delete</button></td>
            </tr>`
          )}
        </table>
        <p>
          <h2>New Posting</h2>
          <div>
            <input id="title" type="text" placeholder="Title">
            <input id="desc" type="text" placeholder="Description">
            <input id="price" type="number" placeholder="Price">
            <input id="sizes" type="text" placeholder="Sizes">
            <input id="inven" type="number" placeholder="Inventory">
            <input id="file" type="file">

            <button @click="${this.sendItem}">Submit</button>
          </div>
        </p>
      </section>
    `
  }

  stateChanged(newState) {
    this._postings = newState.shop.products;
  }

  static get properties() {
    return {
      _postings: {}
    }
  }

  async firstUpdated() {
    this._postings = {};
    store.dispatch(getAllProducts());
  }

  async sendItem() {
    const data = {
      title: this.shadowRoot.getElementById('title').value,
      description: this.shadowRoot.getElementById('desc').value,
      price: this.shadowRoot.getElementById('price').value,
      sizes: this.shadowRoot.getElementById('sizes').value,
      inventory: this.shadowRoot.getElementById('inven').value,
      active: false,
      image: this.shadowRoot.getElementById('file').files[0]
    };

    store.dispatch(createItem(data));
  }

  async deleteItem(id) {
    store.dispatch(deleteItem(id));
  }
}

window.customElements.define('admin-view', AdminView);
