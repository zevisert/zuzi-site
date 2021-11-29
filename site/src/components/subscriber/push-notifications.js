/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { html, LitElement } from "lit";

// This element is connected to the Redux store.
import { store, connect } from "../../store.js";

// These are the shared styles needed by this element.
import { SharedStyles } from "../shared-styles.js";
import { ButtonSharedStyles } from "../button-shared-styles.js";

import {
  createPushSubscriber,
  removePushSubscriber,
  updatePushRegistration,
} from "../../actions/subscriptions";

export class PushSubscriptionSetup extends connect(store)(LitElement) {
  static get is() {
    return "push-subscription-setup";
  }
  static get properties() {
    return {
      push_registered: { type: Boolean, default: false },
      push_subscribed: { type: Boolean, default: false },
      __push_loaded: { type: Boolean, default: false },
    };
  }

  constructor() {
    super();
    this.__els = {};
  }

  render() {
    return html`
      ${SharedStyles} ${ButtonSharedStyles}
      <style>
        label {
          display: flex;
          justify-content: center;
        }

        .push {
          padding-top: 1em;
        }

        .push__form {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .push__form button {
          width: 350px;
        }
      </style>
      <div class="push">
        <label for="push-subscription-button">One-click notifications</label>
        <div class="push__form">
          <button id="push-subscription-button" @click=${this.pushSub}>
            ${(() => {
              if (!this.__push_loaded) return "...";
              if (this.push_subscribed)
                return "Stop receiving notifications from this site";
              if (this.push_subscribed === false)
                return "Receive notifications directly on this device";
            })()}
          </button>
        </div>
      </div>
    `;
  }

  stateChanged(state) {
    this.push_subscribed = state.subscriptions.push.subscribed;
    const registered = state.subscriptions.push.registered;
    if (this.push_registered !== registered && registered) {
      this.push_registered = registered;
      this.updateSWState();
    }

    if (this.__els.pushButton) {
      this.updateBtn();
    }
  }

  async firstUpdated() {
    this.__els = {
      pushButton: this.renderRoot.getElementById("push-subscription-button"),
    };

    // Check for a known service-worker registration
    if (process.swRegistration) {
      store.dispatch(updatePushRegistration(process.swRegistration));
    } else {
      document.addEventListener("zuzi-app-sw-registered", (event) => {
        store.dispatch(updatePushRegistration(event.detail));
      });
    }

    this.updateBtn();
  }

  pushSub() {
    this.__els.pushButton.disabled = true;

    if (this.push_subscribed) {
      // TODO: Unsubscribe user
      store.dispatch(removePushSubscriber());
    } else {
      store.dispatch(createPushSubscriber());
    }
  }

  async updateSWState() {
    // Set the initial subscription value
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    this.__push_loaded = true;

    if (subscription !== null) {
      store.dispatch(createPushSubscriber(subscription));
    } else {
      store.dispatch(removePushSubscriber());
    }
    this.updateBtn();
  }

  updateBtn() {
    if (Notification.permission === "denied") {
      this.__els.pushButton.textContent = "Push Messaging Blocked.";
      this.__els.pushButton.disabled = true;
      store.dispatch(removePushSubscriber());
      return;
    }

    this.__els.pushButton.disabled = false;
  }
}

customElements.define(PushSubscriptionSetup.is, PushSubscriptionSetup);
