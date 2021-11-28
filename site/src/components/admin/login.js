/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html } from 'lit';
import { PageViewElement } from '../page-view-element.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';
import { ButtonSharedStyles } from '../button-shared-styles.js';
import { login, credentials } from '../../actions/app.js';

import { store } from '../../store.js';
import '../underline-input.js';

class LoginView extends PageViewElement {

  static get is() { return 'login-view'; }

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
        <h2>Admin Login</h2>
        <underline-input id="email" type="email" placeholder="Email"></underline-input>
        <underline-input id="password" type="password" placeholder="Password" @keypress="${this._isEnterPress}"></underline-input>
        <button @click="${this._submitForm}">Login</button>
      </section>
    `;
  }

  firstUpdated() {
    store.dispatch(credentials(undefined));
    sessionStorage.removeItem('credentials');
  }

  _isEnterPress(event) {
    const charCode = event.keyCode || event.which;

    if ( charCode == '13' ) {
      // Enter pressed
      this._submitForm();
    }
  }

  async _submitForm() {
    const email = this.renderRoot.getElementById('email').value;
    const password = this.renderRoot.getElementById('password').value;

    store.dispatch(login({email, password}));
  }
}

window.customElements.define(LoginView.is, LoginView);
