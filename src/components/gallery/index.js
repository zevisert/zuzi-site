/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html } from '@polymer/lit-element';
import { PageViewElement } from '../page-view-element.js';

// This element is connected to the Redux store.
import { store, connect } from '../../store.js';

// These are the elements needed by this element.
import './gallery-list.js';
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
import { subscriptions } from "../../reducers/subscriptions"

// We are lazy-loading the subscription reducer
store.addReducers({ subscriptions });

class Gallery extends connect(store)(PageViewElement) {

  static get is() { return 'gallery-view'; }

  static get properties() { return {
    _tags: { type: Array },
    filter: { type: String }
  }}

  constructor() {
    super();
    this.filter = '';
    this._tags = [];
  }

  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      <style>

      .filter {
        max-width: 1600px;
        margin: 0 auto;
      }

      .tags,
      .filter-hint {
        display: flex;
        justify-content: flex-end;
      }

      .filter-hint {
        font-size: small;
        font-style: oblique;
        opacity: 0.5;
        padding: 0 1em;
      }

      .tags span {
        padding: 0 1rem;
        transition: opacity 0.2s;
      }

      .tags span:not(:last-child) {
        border-right: 2px solid #d2d5e4;
      }

      .tags:hover span:not(:hover) {
        opacity: 0.5;
      }

      .subscribers {
        max-width: 1600px;
        display: flex;
        justify-content: center;
        margin: 0 auto;
        padding-top: 4em;
      }

      </style>
      <section class="filter">
        <span class="filter-hint">Filter by</span>
        <div class="tags">
          ${this.filter.length == 0
          ? this._tags.map(t => html`
              <span @click=${() => this.tagClicked(t)}>${t}</span>
            `)

          : html`<span @click=${() => this.tagClicked('')}>Clear</span>`
          }
        </div>
      </section>
      <section>
        <gallery-list filter=${this.filter}></gallery-list>
      </section>
      <section class="subscribers">
        <underline-input id="email" type="email" placeholder="Email"></underline-input>
        <button id="subscription-button" @click=${this.signup}>Subscribe to new posts</button>
      </section>
    `;
  }

  tagClicked(tag) {
    this.filter = tag;
  }

  // This is called every time something is updated in the store.
  stateChanged(state) {
    const allTags = Object.values(state.shop.products).reduce((tags, item) => [... tags, ... item.tags], []);
    this._tags = [... (new Set(allTags)).keys()];

    this.push_subscribed = state.subscriptions.push.subscribed

    const registration = state.subscriptions.push.registration;
    if (this.push_registration !== registration && registration !== null) {
      this.push_registration = registration;
      this.updateSWState()
    }
  }

  async firstUpdated() {
    this.pushButton = this.renderRoot.getElementById("subscription-button")
    store.dispatch(updatePushRegistration(process.swRegistration))
    document.addEventListener('zuzi-app-sw-registered', event => {
      console.log(event.detail)
      store.dispatch(updatePushRegistration(event.detail))
    })
  }

  signup() {
    this.pushButton.disabled = true;
    //store.dispatch(createEmailSubscriber(this.renderRoot.getElementById('email').value))

    if (this.push_subscribed) {
      // TODO: Unsubscribe user
      console.log("TODO: unsub user")
    } else {
      store.dispatch(createPushSubscriber())
    }
  }

  async updateSWState() {
    // Set the initial subscription value
    const subscription = await this.push_registration.pushManager.getSubscription()

    if (subscription !== null) {
      store.dispatch(createPushSubscriber(subscription))
    } else {
      store.dispatch(removePushSubscriber())
    }
  }

  updateBtn() {
    if (Notification.permission === 'denied') {
      this.pushButton.textContent = 'Push Messaging Blocked.';
      this.pushButton.disabled = true;
      store.dispatch(removePushSubscriber())
      return;
    }

    if (this.push_subscribed) {
      this.pushButton.textContent = 'Disable Push Messaging';
    } else {
      this.pushButton.textContent = 'Enable Push Messaging';
    }

    this.pushButton.disabled = false;
  }
}



window.customElements.define(Gallery.is, Gallery);
