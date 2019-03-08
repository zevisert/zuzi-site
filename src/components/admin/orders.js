/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html } from '@polymer/lit-element';
import { PageViewElement } from '../page-view-element.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';
import { store, connect } from '../../store.js';
import { ButtonSharedStyles } from '../button-shared-styles.js';
import { SharedDynamicTable } from '../dynamic-table-styles.js';

import '../underline-input.js';
import { processEtransfer, getOrders } from '../../actions/admin.js';
import { admin, orderSelector } from '../../reducers/admin.js';

// We are lazy-loading the admin reducer
store.addReducers({ admin });

class AdminConfirm extends connect(store)(PageViewElement) {

  static get is() { return 'admin-orders'; }

  static get properties() { return {
    _order: { type: Object, attribute: false },
    _rejecting: { type: Boolean, attribute: false }
  }}

  constructor() {
    super();
    this._order = { items: [] };
    this._rejecting = false;
  }

  render() {

    const { items=[], customer={ shipping: { address_lines: [] }}, ...order } = this._order;

    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      ${SharedDynamicTable}
      <style>
        td img {
          max-width: 80px;
        }

        tbody tr:hover {
          cursor: initial;
        }

        @media screen and (max-width: 725px) {
          table tbody tr td:nth-child(1):before { content: "Icon"; }
          table tbody tr td:nth-child(2):before { content: "Title"; }
          table tbody tr td:nth-child(3):before { content: "Quantity"; }
          table tbody tr td:nth-child(4):before { content: "Size"; }
          table tbody tr td:nth-child(5):before { content: "Medium"; }
          table tbody tr td:nth-child(6):before { content: "Unit Price"; }
        }
      </style>
      <section>
        <h2>Order: ${order._id}</h2>
        <h3>Total: $${(order.totalCents / 100).toFixed(2)}</h3>
        <h3>Payment Type: ${order.type}</h3>
        <h3>Status: ${order.status}</h3>
        ${order.type === 'etransfer' && order.status === 'pending'
          ? html`
            <button id="confirm" @click="${e => this._processOrder(true)}">Confirm Payment Received</button>
            <button id="reject" @click="${e => this._processOrder(false)}">Reject Order</button>
          `
          : html`

          `
        }
        ${this._rejecting === true
          ? html`
            <underline-input id="reason" type="text" placeholder="Reason for rejecting"></underline-input>
          `
          : html``
        }
        <h2>Shipping Info</h2>
        <section>
          <div><b>Name: </b>${customer.name}</div>
          <div><b>Email: </b>${customer.email}</div>
          <div><b>Address: </b>${customer.shipping.address_lines.join(',')}</div>
          <div><b>City: </b>${customer.shipping.locality}</div>
          <div><b>Province: </b>${customer.shipping.region}</div>
          <div><b>Postal Code: </b>${customer.shipping.postal_code}</div>
          <div><b>Country: </b>${customer.shipping.country}</div>
        </section>
        <h2>Order Items</h2>
        <div class="limiter">
          <div class="container-table100">
            <div class="wrap-table100">
              <div class="table100">
                <table>
                  <thead>
                    <tr class="table100-head">
                      <th class="column1">Icon</th>
                      <th class="column2">Title</th>
                      <th class="column3">Quantity</th>
                      <th class="column4">Size</th>
                      <th class="column5">Medium</th>
                      <th class="column6">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map(({quantity, item, pricing}) => html`
                      <tr>
                        <td class="column1"><img src="/uploads/${item.preview}"></td>
                        <td class="column2">${item.title}</td>
                        <td class="column3">${quantity}</td>
                        <td class="column4">${pricing.size.width} x ${pricing.size.height} ${pricing.size.unit}</td>
                        <td class="column5">${pricing.medium}</td>
                        <td class="column6">${pricing.price ? `$${pricing.price.toFixed(2)}` : "$---"}</td>
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

  async stateChanged(state) {

    if (state.app.page === 'admin' && state.app.subPage && state.app.subPage.startsWith('orders/')) {

      const [route, orderId] = state.app.subPage.split('/');

      if (route !== 'orders' || orderId === undefined) {
        throw new Error('Something wrong in /admin/orders navigation');
      }

      const order = orderSelector(orderId)(state);
      if (order === undefined) {
        store.dispatch(getOrders(orderId));
      } else {
        this._order = order;
        this.requestUpdate('order');
      }
    }
  }

  async _processOrder(accepted) {
    let reason = undefined;

    if (! accepted && ! this._rejecting ) {
      this._rejecting = true;
      return;
    } else if (this._rejecting) {
      let reasonInput = this.renderRoot.getElementById('reason');
      const isText = value => !!value && /^(?![\s.]+$)[a-zA-Z0-9\s.]+$/.test(value);

      if (! isText(reasonInput.value)) {
        reasonInput.value = '';
        reasonInput.error = true;
        return;
      } else {
        reason = reasonInput.value;
        this._rejecting = false;
      }
    }

    store.dispatch(processEtransfer({
      accepted,
      orderId: this._order._id,
      reason
    }));
  }
}

window.customElements.define(AdminConfirm.is, AdminConfirm);
