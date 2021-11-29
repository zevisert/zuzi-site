/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { html, LitElement } from "lit";

// This element is connected to the Redux store.
import { store, connect } from "../../store.js";

// These are the elements needed by this element.
import "./email-notifications.js";
import "./push-notifications.js";

// These are the shared styles needed by this element.
import { SharedStyles } from "../shared-styles.js";
import { ButtonSharedStyles } from "../button-shared-styles.js";

// We are lazy-loading the subscription reducer
import { subscriptions } from "../../reducers/subscriptions";
store.addReducers({ subscriptions });

export class SubscriptionSetup extends connect(store)(LitElement) {
  static get is() {
    return "subscription-setup";
  }
  static get properties() {
    return {};
  }

  render() {
    return html`
      ${SharedStyles} ${ButtonSharedStyles}
      <style>
        .subscribers {
          display: flex;
          flex-direction: column;
          max-width: 600px;
          margin: 4em auto;
        }

        p {
          text-align: center;
        }

        h3 {
          display: flex;
          justify-content: center;
          position: relative;
        }

        h3::before,
        h3::after {
          content: "";
          position: relative;
          top: 15px;
          height: 1px;
          width: 30%;
          background-color: black;
        }

        h3::after {
          left: 10px;
        }
        h3::before {
          right: 10px;
        }
      </style>
      <section class="subscribers">
        <summary>
          <h3>Looking for more?</h3>
          <p>Sign up below to be notified when new artwork is posted.</p>
        </summary>
        ${(() => {
          if (
            "Notification" in window &&
            "serviceWorker" in navigator &&
            !/Safari/.test(navigator.userAgent)
          ) {
            return html`<push-subscription-setup></push-subscription-setup>`;
          }
        })()}
        <email-subscription-setup></email-subscription-setup>
      </section>
    `;
  }
}

customElements.define(SubscriptionSetup.is, SubscriptionSetup);
