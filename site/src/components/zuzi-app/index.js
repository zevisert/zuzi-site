/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { LitElement, html } from "lit";
import { installMediaQueryWatcher } from "pwa-helpers/media-query.js";
import { installOfflineWatcher } from "pwa-helpers/network.js";
import { installRouter } from "pwa-helpers/router.js";
import { updateMetadata } from "pwa-helpers/metadata.js";

// This element is connected to the Redux store.
import { store, connect } from "../../store.js";

// These are the actions needed by this element.
import {
  navigate,
  updateOffline,
  updateLayout,
  credentials,
} from "../../actions/app.js";

import * as str from "./strings.js";
import { cartQuantitySelector } from "../../reducers/shop.js";

import "./nav-box";
import "../snackbar";

class ZuziApp extends connect(store)(LitElement) {
  static get is() {
    return "zuzi-app";
  }

  static get properties() {
    return {
      appTitle: { type: String },
      _page: { type: String },
      _subPage: { type: String },
      _cartQuantity: { type: Number },
      _loggedIn: { type: Boolean },
    };
  }

  render() {
    // Anything that's related to rendering should be done in here.
    return html`
      <style>
        :host {
          display: flex;
          min-height: calc(100vh + 48px);
          flex-direction: column;
          background: url(images/page-bg.jpg);
        }

        header {
          position: fixed;
          width: 100%;
          min-height: 85px;
          background-color: white;
          box-shadow: 0 0 20px 0px #e0e0e0;
          z-index: 1;
        }

        .fixed {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 12px;
        }

        .site-title {
          display: none;
          font-size: 25px;
          font-weight: bold;
          font-family: "Julius Sans One";
        }

        /* Workaround for IE11 displaying <main> as inline */
        main {
          display: block;
          margin: 85px 0px 0px 0px;
          padding: 20px;
          flex: 1 0 auto;
          background: white;
          box-shadow: 0 0 20px 2px black;
        }

        .page {
          display: none;
        }

        .page[active] {
          display: block;
          animation: pageenter 1s forwards;
        }

        footer {
          border-top: 3px solid #ccc;
          flex-shrink: 0;
          padding: 10px 24px;
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
          padding-left: 1em;
        }

        .login a:hover {
          text-decoration: underline;
        }

        @keyframes pageenter {
          from {
            transform: translateY(-10vh);
          }

          to {
            transform: translateY(0);
          }
        }

        /* Medium layout */
        @media only screen and (min-width: 640px) {
          .fixed {
            flex-direction: row;
            justify-content: space-between;
            padding: 24px;
          }

          main {
            margin: 85px 48px 100px 48px;
          }

          .site-title {
            display: block;
          }
        }

        /* Wide layout */
        @media only screen and (min-width: 1756px) {
          main {
            margin: 85px auto 100px auto;
            min-width: 1600px;
          }
        }
      </style>

      <header>
        <div class="fixed">
          <nav class="toolbar-list">
            <nav-box
              title="About"
              page="${this._page}"
              target="${str.pages.about}"
            ></nav-box>
            <nav-box
              title="Gallery"
              page="${this._page}"
              target="${str.pages.gallery}"
            ></nav-box>
            <nav-box
              title="Cart"
              page="${this._page}"
              target="${str.pages.cart}"
            ></nav-box>
            <nav-box
              title="Tour"
              page="${this._page}"
              target="${str.pages.tour}"
            ></nav-box>
            ${(() => {
              if (this._loggedIn) {
                return html`<nav-box
                  title="Admin"
                  page="${this._page}"
                  target="${str.pages.admin}"
                ></nav-box>`;
              }
            })()}
          </nav>
          <span class="site-title">Zuzana Riha</span>
        </div>
      </header>

      <!-- Main content -->
      <main role="main" class="main-content">
        <about-view class="page" ?active="${this._page === str.pages.about}">
        </about-view>

        <gallery-view
          class="page"
          ?active="${this._page === str.pages.gallery && this._subPage === null}"
        >
        </gallery-view>

        <virtual-tour-page
          class="page"
          ?active="${this._page === str.pages.tour && this._subPage === null}"
        >
        </virtual-tour-page>

        <gallery-item
          class="page"
          ?active="${this._page === str.pages.gallery && this._subPage !== null}"
        >
        </gallery-item>

        <cart-view class="page" ?active="${this._page === str.pages.cart}">
          <slot slot="stripe-card" name="stripe-card"></slot>
        </cart-view>

        <admin-view
          class="page"
          ?active="${this._page === str.pages.admin && this._subPage === null}"
        >
        </admin-view>

        <admin-edit
          class="page"
          ?active="${this._page === str.pages.admin &&
          this._subPage !== null &&
          !this._subPage.split("/").includes("orders")}"
        >
        </admin-edit>

        <admin-password
          class="page"
          ?active="${this._page === str.pages.admin &&
          this._subPage !== null &&
          this._subPage === "change-password"}"
        >
        </admin-password>

        <admin-orders
          class="page"
          ?active="${this._page === str.pages.admin &&
          this._subPage !== null &&
          this._subPage.split("/").includes("orders")}"
        >
        </admin-orders>

        <login-view class="page" ?active="${this._page === str.pages.login}">
        </login-view>

        <no-view class="page" ?active="${this._page === str.pages.none}"> </no-view>
      </main>

      <app-snackbar></app-snackbar>

      <footer>
        <section>
          <span class="zev">Made with ♥ by Zev Isert</span>
          <div class="login">
            <span>
              ${this._loggedIn
                ? html` <a href="/admin/change-password">Change Password</a>
                    <a href="${process.env.API_URL}/auth/logout" target="_self"
                      >Logout</a
                    >`
                : html`<a href="/${str.pages.login}">Login</a>`}
            </span>
          </div>
        </section>
      </footer>
    `;
  }

  firstUpdated() {
    installRouter((location) =>
      store.dispatch(navigate(decodeURIComponent(location.pathname)))
    );
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    installMediaQueryWatcher(`(min-width: 716px)`, (medium) =>
      store.dispatch(updateLayout(medium, false))
    );
    installMediaQueryWatcher(`(min-width: 1756px)`, (wide) =>
      store.dispatch(updateLayout(true, wide))
    );

    if (sessionStorage.getItem("credentials")) {
      store.dispatch(credentials(JSON.parse(sessionStorage.getItem("credentials"))));
    }

    if (process.env.SENTRY_ENABLE) {
      window.requestIdleCallback =
        window.requestIdleCallback ||
        function (handler) {
          let startTime = Date.now();

          return setTimeout(function () {
            handler({
              didTimeout: false,
              timeRemaining: function () {
                return Math.max(0, 50.0 - (Date.now() - startTime));
              },
            });
          }, 1);
        };

      // import * as Sentry from "@sentry/browser"
      // import { Integrations } from "@sentry/tracing"
      window.requestIdleCallback(() =>
        Promise.all([import("@sentry/browser"), import("@sentry/tracing")]).then(
          ([{ init }, { Integrations }]) => {
            init({
              dsn: process.env.SENTRY_DSN,
              integrations: [new Integrations.BrowserTracing()],
              tracesSampleRate: 1.0,
            });
          }
        )
      );
    }

    window.requestIdleCallback(() => {
      import("https://js.stripe.com/v3/");
    });
  }

  updated(changedProps) {
    if (changedProps.has("_page")) {
      const pageTitle = this.appTitle + " - " + this._page;
      updateMetadata({
        title: pageTitle,
        description: pageTitle,
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
