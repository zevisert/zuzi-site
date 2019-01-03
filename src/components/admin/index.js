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
import { getAllProducts } from '../../actions/shop.js';
import { deleteItem, createItem, getOrders } from '../../actions/admin.js';
import { ButtonSharedStyles } from '../button-shared-styles.js';
import { SharedDynamicTable } from '../dynamic-table-styles.js';
import { navigate } from '../../actions/app.js';

import { admin } from '../../reducers/admin.js';

store.addReducers({ admin });

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
          color: black;
          border: 2px solid black;
          font-weight: bold;
        }

        @media screen and (max-width: 725px) {
          #section-artwork table tbody tr td:nth-child(1):before { content: "Icon"; }
          #section-artwork table tbody tr td:nth-child(2):before { content: "Public URL"; }
          #section-artwork table tbody tr td:nth-child(3):before { content: "Title"; }
          #section-artwork table tbody tr td:nth-child(4):before { content: "Description"; }
          #section-artwork table tbody tr td:nth-child(5):before { content: "Active"; }
          #section-artwork table tbody tr td:nth-child(6):before { content: "Delete"; }

          #section-orders table tbody tr td:nth-child(1):before { content: "Customer"; }
          #section-orders table tbody tr td:nth-child(2):before { content: "Total"; }
          #section-orders table tbody tr td:nth-child(3):before { content: "Items"; }
          #section-orders table tbody tr td:nth-child(4):before { content: "Payment Type"; }
          #section-orders table tbody tr td:nth-child(5):before { content: "Status"; }
          #section-orders table tbody tr td:nth-child(6):before { content: "Order ID"; }
        }
      </style>
      <h2>Admin View</h2>
      <section id="section-artwork">
        <h3>Posted Artwork</h3>
        <div class="limiter">
          <div class="container-table100">
            <div class="wrap-table100">
              <div class="table100">
                <table>
                  <thead>
                    <tr class="table100-head">
                      <th class="column1">Icon</th>
                      <th class="column2">Public URL</th>
                      <th class="column3">Title</th>
                      <th class="column4">Description</th>
                      <th class="column5">Active</th>
                      <th class="column6">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.values(this._postings).map(post => html`
                      <tr @click="${() => store.dispatch(navigate(`/admin/${post.slug}`))}">
                        <td class="column1"><img src="/uploads/${post.preview}"></td>
                        <td class="column2">https://zuzi.art/gallery/${post.slug}</td>
                        <td class="column3">${post.title}</td>
                        <td class="column4">${post.description}</td>
                        <td class="column5">${post.active}</td>
                        <td class="column6">
                          <button @click="${(e) => { e.stopPropagation(); this.deleteItem(post.slug); }}">Delete</button>
                        </td>
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

      <section id="section-orders">
      <h3>Order History</h3>
        <div class="limiter">
          <div class="container-table100">
            <div class="wrap-table100">
              <div class="table100">
                <table>
                  <thead>
                    <tr class="table100-head">
                      <th class="column1">Customer</th>
                      <th class="column2">Total</th>
                      <th class="column3">Items</th>
                      <th class="column4">Payment Type</th>
                      <th class="column5">Status</th>
                      <th class="column6">Order ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.values(this._orders).map(order => html`
                      <tr @click="${() => store.dispatch(navigate(`/admin/orders/${order._id}`))}">
                        <td class="column1">${order.customer.name}</td>
                        <td class="column2">${(order.totalCents / 100).toFixed(2)}</td>
                        <td class="column3">${order.items.reduce((count, {quantity}) => count + quantity, 0)}</td>
                        <td class="column4">${order.type}</td>
                        <td class="column5">${order.status}</td>
                        <td class="column6">${order._id}</td>
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

  stateChanged(newState) {
    this._postings = newState.shop.products;
    this._orders = newState.admin.orders;
  }

  static get properties() {
    return {
      _postings: { type: Object, attribute: false },
      _orders: { type: Array, attribute: false }
    }
  }

  constructor() {
    super();
    this._postings = {};
    this._orders = [];
  }

  async firstUpdated() {
    store.dispatch(getAllProducts());
    store.dispatch(getOrders());
  }

  async sendItem() {
    const data = {
      title: this.shadowRoot.getElementById('title').value,
      description: this.shadowRoot.getElementById('desc').value,
      price: this.shadowRoot.getElementById('price').value,
      sizes: this.shadowRoot.getElementById('sizes').value,
      active: false,
      image: this.shadowRoot.getElementById('file').files[0]
    };

    store.dispatch(createItem(data));
  }

  async deleteItem(slug) {
    store.dispatch(deleteItem(slug));
  }
}

window.customElements.define('admin-view', AdminView);
