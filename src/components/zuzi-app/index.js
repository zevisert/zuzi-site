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

import '../snackbar';

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
        position: fixed;
        width: 100%;
        min-height: 85px;
        background-color: white;
        box-shadow: 0 0 20px 0px #E0E0E0;
        z-index: 1;
      }

      .fixed {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px;
      }

      .site-title {
        display: none;
        font-size: 25px;
        font-weight: bold;
        font-family: 'Julius Sans One';
      }

      .toolbar-list > a {
        display: inline-block;
        color: gray;
        text-decoration: none;
        font-family: 'Julius Sans One';
        padding: 0 8px;
        border: 1px solid transparent;
      }

      .toolbar-list > a[selected] {
        font-weight: bold;
        color: black;
        border: 1px solid black;
      }

      /* Workaround for IE11 displaying <main> as inline */
      main {
        display: block;
        margin-top: 85px;
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
        padding: 10px 24px;
        background-color: white;
      }

      footer section {
        display: flex;
        justify-content: space-between;
      }

      .zev {
        color: lightgrey;
      }

      .login {
        display: flex;
        flex-direction: row-reverse;
      }

      .login a {
        color: lightgray;
        text-decoration: none;
      }

      .login a:hover {
        color: black;
      }

      /* Medium layout */
      @media (min-width: 640px) {
        .fixed {
          flex-direction: row;
          justify-content: space-between;
        }

        .site-title {
          display: block;
        }
      }
    </style>

    <header>
      <div class="fixed">
        <nav class="toolbar-list">
          <a
          ?selected="${this._page === str.pages.about}"
          href="/${str.pages.about}">
            About
          </a>

          <a
          ?selected="${this._page === str.pages.gallery}"
          href="/${str.pages.gallery}">
            Gallery
          </a>

          <a
          ?selected="${this._page === str.pages.cart}"
          href="/${str.pages.cart}">
            Cart (${this._cartQuantity})
          </a>

          ${! this._loggedIn ? '' : html`
            <a
            ?selected="${this._page === str.pages.admin}"
            href="/${str.pages.admin}">
              Admin
            </a>`
          }
        </nav>
        <span class="site-title">Zuzana Riha</span>
      </div>
    </header>

    <!-- Main content -->
    <main role="main" class="main-content">
      <about-view class="page"
        ?active="${this._page === str.pages.about}">
      </about-view>

      <gallery-view class="page"
        ?active="${this._page === str.pages.gallery && this._subPage === null}">
      </gallery-view>

      <gallery-item class="page"
        ?active="${this._page === str.pages.gallery && this._subPage !== null}">
      </gallery-item>

      <cart-view class="page"
        ?active="${this._page === str.pages.cart}">
        <slot slot="stripe-card" name="stripe-card"></slot>
      </cart-view>

      <admin-view class="page"
        ?active="${this._page === str.pages.admin && this._subPage === null}">
      </admin-view>

      <admin-edit class="page"
        ?active="${
          this._page === str.pages.admin
          && this._subPage !== null
          && ! this._subPage.split('/').includes('orders')
        }">
      </admin-edit>

      <admin-orders class="page"
        ?active="${
          this._page === str.pages.admin
          && this._subPage !== null
          && this._subPage.split('/').includes('orders')
        }">
      </admin-orders>

      <login-view class="page"
        ?active="${this._page === str.pages.login}">
      </login-view>

      <no-view class="page"
        ?active="${this._page === str.pages.none}">
      </no-view>
    </main>

    <app-snackbar></app-snackbar>

    <footer>
      <section>
        <span class="zev">Made with ♥ by Zev Isert</span>
        <div class="login">
          <span>
            ${this._loggedIn
            ? html`<a href="${process.env.API_URL}/auth/logout" target="_self">Logout</a>`
            : html`<a href="/${str.pages.login}">Login</a>`
            }
          </span>
        </div>
    </section>
    </footer>
    `;
  }

  static get is() { return 'zuzi-app'; }

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
    installRouter(location => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installOfflineWatcher(offline => store.dispatch(updateOffline(offline)));
    installMediaQueryWatcher(`(min-width: 460px)`, matches => store.dispatch(updateLayout(matches)));

    if (sessionStorage.getItem('credentials')) {
      store.dispatch(credentials(JSON.parse(sessionStorage.getItem('credentials'))));
    }

    if ( process.env.SENTRY_ENABLE ) {
      Sentry.init({ dsn: process.env.SENTRY_DSN });
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

window.customElements.define(ZuziApp.is, ZuziApp);
