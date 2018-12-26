/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement, html } from '@polymer/lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js';
import { installOfflineWatcher } from 'pwa-helpers/network.js';
import { installRouter } from 'pwa-helpers/router.js';
import { updateMetadata } from 'pwa-helpers/metadata.js';

// This element is connected to the Redux store.
import { store } from '../../store.js';

// These are the actions needed by this element.
import {
  navigate,
  updateOffline,
  updateLayout,
  credentials
} from '../../actions/app.js';

import * as str from './strings.js';
import { cartQuantitySelector } from '../../reducers/shop.js';

class ZuziApp extends connect(store)(LitElement) {
  render() {
    // Anything that's related to rendering should be done in here.
    return html`
    <style>
      :host {
        display: flex;
        min-height: 100vh;
        flex-direction: column;
      }

      header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px 24px 0;
      }

      .toolbar-list > a {
        display: inline-block;
        color: black;
        text-decoration: none;
        padding: 0 8px;
      }

      .toolbar-list > a[selected] {
        font-weight: bold;
      }

      /* Workaround for IE11 displaying <main> as inline */
      main {
        display: block;
        padding: 24px;
        flex: 1 0 auto;
      }

      .page {
        display: none;
      }

      .page[active] {
        display: block;
      }

      footer {
        border-top: 1px solid #ccc;
        flex-shrink: 0;
        padding: 10px 24px 24px;
      }

      /* Wide layout */
      @media (min-width: 460px) {
        header {
          flex-direction: row;
        }

        /* The drawer button isn't shown in the wide layout, so we don't
        need to offset the title */
        [main-title] {
          padding-right: 0px;
        }
      }
    </style>

    <header>
      <nav class="toolbar-list">
        <a ?selected="${this._page === str.pages.about}"   href="/${str.pages.about}">${str.pages.about}</a>
        <a ?selected="${this._page === str.pages.gallery}" href="/${str.pages.gallery}">${str.pages.gallery}</a>
        <a ?selected="${this._page === str.pages.cart}"    href="/${str.pages.cart}">${str.pages.cart} (${this._cartQuantity})</a>
      </nav>
    </header>

    <!-- Main content -->
    <main role="main" class="main-content">
      <about-view class="page" ?active="${this._page === str.pages.about}"></about-view>

      <gallery-view class="page" ?active="${this._page === str.pages.gallery && this._subPage === null}"></gallery-view>
      <gallery-item class="page" ?active="${this._page === str.pages.gallery && this._subPage !== null}"></gallery-item>
      <cart-view    class="page" ?active="${this._page === str.pages.cart}">
        <slot slot="stripe-card" name="stripe-card"></slot>
      </cart-view>

      <admin-view    class="page" ?active="${this._page === str.pages.admin && this._subPage === null}"></admin-view>
      <admin-edit    class="page" ?active="${this._page === str.pages.admin && this._subPage !== null && this._subPage.split('/').includes('orders') === false}"></admin-edit>
      <admin-orders  class="page" ?active="${this._page === str.pages.admin && this._subPage !== null && this._subPage.split('/').includes('orders') === true }"></admin-orders>
      <login-view class="page" ?active="${this._page === str.pages.login}"></login-view>

      <no-view class="page" ?active="${this._page === str.pages.none}"></no-view>
    </main>

    <footer>
      <span>
        ${this._loggedIn ?
          html`<a href="/admin">Admin Page</a> | <a href="${process.env.API_URL}/auth/logout" rel="external">Logout</a>` :
          html`<a href="/login">Login</a>`
        }
      </span>
    </footer>
    `;
  }

  static get properties() {
    return {
      appTitle: { type: String },
      _page: { type: String },
      _subPage: { type: String },
      _cartQuantity: { type: Number },
      _loggedIn: { type: Boolean }
    }
  }

  firstUpdated() {
    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    installMediaQueryWatcher(`(min-width: 460px)`,
        (matches) => store.dispatch(updateLayout(matches)));

    Sentry.init({ dsn: process.env.SENTRY_DSN });

    if (sessionStorage.getItem('credentials')) {
      store.dispatch(credentials(JSON.parse(sessionStorage.getItem('credentials'))));
    }
  }

  updated(changedProps) {
    if (changedProps.has('_page')) {
      const pageTitle = this.appTitle + ' - ' + this._page;
      updateMetadata({
        title: pageTitle,
        description: pageTitle
        // This object also takes an image property, that points to an img src.
      });
    }
  }

  stateChanged(state) {
    this._page = state.app.page;
    this._subPage = state.app.subPage;
    this._cartQuantity = cartQuantitySelector(state);
    this._loggedIn = !!state.app.credentials;
  }
}

window.customElements.define('zuzi-app', ZuziApp);
