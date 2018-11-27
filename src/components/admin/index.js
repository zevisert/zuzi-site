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
import { SharedDynamicTable } from '../dynamic-table-styles.js';
import { navigate } from '../../actions/app.js';

class AdminView extends connect(store)(PageViewElement) {
  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      ${SharedDynamicTable}
      <style>
        td img {
          max-width: 40px;
        }

        .table100-head {
          background-color: gray;
          color: white;
          font-weight: bold;
        }

        button {
          border: 2px solid black;
          border-radius: 3px;
          padding: 8px 16px;
        }

        @media screen and (max-width: 725px) {
          table tbody tr td:nth-child(1):before { content: "Icon"; }
          table tbody tr td:nth-child(2):before { content: "Post ID"; }
          table tbody tr td:nth-child(3):before { content: "Title"; }
          table tbody tr td:nth-child(4):before { content: "Description"; }
          table tbody tr td:nth-child(5):before { content: "Price"; }
          table tbody tr td:nth-child(6):before { content: "Sizes"; }
          table tbody tr td:nth-child(7):before { content: "Inventory"; }
          table tbody tr td:nth-child(8):before { content: "Active"; }
          table tbody tr td:nth-child(9):before { content: "Delete"; }
        }
      </style>
      <section>
        <h2>Admin View</h2>
        <div class="limiter">
          <div class="container-table100">
            <div class="wrap-table100">
              <div class="table100">
                <table>
                  <thead>
                    <tr class="table100-head">
                      <th class="column1">Icon</th>
                      <th class="column2">Post ID</th>
                      <th class="column3">Title</th>
                      <th class="column4">Description</th>
                      <th class="column5">Price</th>
                      <th class="column6">Sizes</th>
                      <th class="column7">Inventory</th>
                      <th class="column8">Active</th>
                      <th class="column9">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.values(this._postings).map(post => html`
                      <tr @click="${() => store.dispatch(navigate(`/admin/${post.id}`))}">
                        <td class="column1"><img src="/uploads/${post.preview}"></td>
                        <td class="column2">${post.id}</td>
                        <td class="column3">${post.title}</td>
                        <td class="column4">${post.description}</td>
                        <td class="column5">${post.price}</td>
                        <td class="column6">${this.parseSizes(post.sizes)}</td>
                        <td class="column7">${post.inventory}</td>
                        <td class="column8">${post.active}</td>
                        <td class="column9"><button @click="${() => this.deleteItem(post.id)}">Delete</button></td>
                      </tr>`
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      <a href="/admin/new"><button>New Posting</button></a>
      </section>
    `
  }

  parseSizes(sizes) {
    return sizes.map(size => `${size.width}x${size.height}`).join(', ');
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
