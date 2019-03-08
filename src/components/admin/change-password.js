/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html } from '@polymer/lit-element';
import { PageViewElement } from '../page-view-element.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';
import { ButtonSharedStyles } from '../button-shared-styles.js';
import { store } from '../../store.js';
import { changePassword } from '../../actions/admin.js';

import '../underline-input.js';

class AdminChangePasswordView extends PageViewElement {

  static get is() { return 'admin-password'; }

  static get properties() { return {

  }}

  constructor() {
    super();
  }

  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      <style>
        section {
          display: grid;
          grid-auto-rows: minmax(min-content, max-content);
          justify-content: center;
          grid-row-gap: 5px;
        }
      </style>
      <section>
        <h2>Change Password</h2>
        <underline-input id="existing" type="password" placeholder="Old Password"></underline-input>
        <underline-input id="new" type="password" placeholder="New Password" @keypress="${this._isEnterPress}"></underline-input>
        <button @click="${this._submitForm}">Change</button>
      </section>
    `;
  }

  _isEnterPress(event) {
    const charCode = event.keyCode || event.which;

    if ( charCode == '13' ) {
      // Enter pressed
      this._submitForm();
    }
  }

  async _submitForm() {
    const email = store.getState().app.credentials.email;

    const oldPassword = this.renderRoot.getElementById('existing').value;
    const newPassword = this.renderRoot.getElementById('new').value;

    store.dispatch(changePassword(email, oldPassword, newPassword));
  }
}

window.customElements.define(AdminChangePasswordView.is, AdminChangePasswordView);
