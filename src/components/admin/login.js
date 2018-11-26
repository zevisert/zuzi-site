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
import { login, credentials } from '../../actions/app.js';
import { store } from '../../store.js';

class LoginView extends PageViewElement {
  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      <style>
        .form {
          display: grid;
          grid-template-columns: 100%;
        }

        .form input,
        .form button {
          max-width: 180px;
        }
      </style>
      <section>
        <h2>Admin Login</h2>
        <div class="form">
          <label for="password">
            Password
          </label>
          <input id="password" type="password" placeholder="Password">
          <button
            @click="${this._submitForm}">
            Login
          </button>
        </div>
      </section>
    `;
  }

  firstUpdated() {
    store.dispatch(credentials(undefined));
    sessionStorage.removeItem('credentials');
  }

  async _submitForm() {
    const password = this.shadowRoot.getElementById('password').value;

    store.dispatch(login({username: 'user', password}));
  }
}

window.customElements.define('login-view', LoginView);
