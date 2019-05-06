/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html, LitElement } from '@polymer/lit-element';
import { PageViewElement } from '../page-view-element.js';

// This element is connected to the Redux store.
import { store, connect } from '../../store.js';

// These are the elements needed by this element.
import '../underline-input.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';
import { ButtonSharedStyles } from '../button-shared-styles.js';

import {
  createPushSubscriber,
  removePushSubscriber,
  updatePushRegistration,
  createEmailSubscriber,
} from '../../actions/subscriptions';

// We are lazy-loading the subscription reducer
import { subscriptions } from "../../reducers/subscriptions"
store.addReducers({ subscriptions });

export class SubscriptionSetup extends connect(store)(LitElement) {
  static get is() { return 'subscription-setup'; }
  static get properties() { return {
    push_registered: { type: Boolean, default: false },
    push_subscribed: { type: Boolean, default: false }
  }}

  constructor() {
    super();

  }

  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      <style>
        .subscribers {
          max-width: 500px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin: 0 auto;
          padding-top: 4em;
        }
      </style>
      <section class="subscribers">
        <h3>Looking for more?</h3>
        <p>Sign up below to be notified when new artwork is posted here.</p>
        <div>
          <div>Receive push notifications directly on this device</div>
          <button id="push-subscription-button" @click=${this.pushSub}>
            ${this.push_subscribed ? 'Disable Push Messaging' : 'Enable Push Messaging'}
          </button>
        </div>
        <div>
          <div>Receive notifications through email</div>
          <div>
            <underline-input id="email" type="email" placeholder="Email"></underline-input>
          </div>
          <button id="email-subscription-button" @click=${this.emailSub}>Subscribe now</button>
        </div>
      </section>
    `;
  }

  stateChanged(state) {
    this.push_subscribed = state.subscriptions.push.subscribed
    const registered = state.subscriptions.push.registered
    if (this.push_registered !== registered && registered) {
      this.push_registered = registered;
      this.updateSWState()
    }

    if (this.pushButton) {
      this.updateBtn()
    }
  }

  async firstUpdated() {
    this.pushButton = this.renderRoot.getElementById("push-subscription-button")
    store.dispatch(updatePushRegistration(process.swRegistration))
    document.addEventListener('zuzi-app-sw-registered', event => {
      store.dispatch(updatePushRegistration(event.detail))
    });

    this.updateBtn()
  }

  pushSub() {
    this.pushButton.disabled = true;

    if (this.push_subscribed) {
      // TODO: Unsubscribe user
      store.dispatch(removePushSubscriber())
    } else {
      store.dispatch(createPushSubscriber())
    }
  }

  emailSub() {
    store.dispatch(createEmailSubscriber(this.renderRoot.getElementById('email').value))
  }

  async updateSWState() {
    // Set the initial subscription value
    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = await registration.pushManager.getSubscription()

    if (subscription !== null) {
      store.dispatch(createPushSubscriber(subscription))
    } else {
      store.dispatch(removePushSubscriber())
    }
    this.updateBtn()
  }

  updateBtn() {
    if (Notification.permission === 'denied') {
      this.pushButton.textContent = 'Push Messaging Blocked.';
      this.pushButton.disabled = true;
      store.dispatch(removePushSubscriber())
      return;
    }

    this.pushButton.disabled = false;
  }
}

customElements.define(SubscriptionSetup.is, SubscriptionSetup);
