/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html, LitElement } from '@polymer/lit-element'

// This element dispatches to the Redux store.
import { store } from '../../store.js'

// These are the elements needed by this element.
import '../underline-input.js'

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js'
import { ButtonSharedStyles } from '../button-shared-styles.js'

import {
  createEmailSubscriber,
} from '../../actions/subscriptions'


export class EmailSubscriptionSetup extends LitElement {
  static get is() { return 'email-subscription-setup' }
  static get properties() { return {

  }}

  constructor() {
    super()
    this.__els = {}
  }

  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      <style>
        .email {
          padding-top: 1em;
        }

        .email__form {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .email__form button {
          width: 100%;
        }

        .email__form underline-input {
          width: 100%;
        }

      </style>
      <div class="email">
        <div>Receive notifications through email</div>
        <div class="email__form">
          <underline-input id="email-subscription-input" type="email" placeholder="Email" @input=${this.emailValidate}></underline-input>
          <button id="email-subscription-button" disabled @click=${this.emailSub}>Subscribe</button>
        </div>
      </div>
    `
  }

  async firstUpdated() {
    this.__els = {
      emailInput: this.renderRoot.getElementById('email-subscription-input'),
      emailButton: this.renderRoot.getElementById('email-subscription-button'),
    }
  }

  emailSub() {
    store.dispatch(createEmailSubscriber(this.__els.emailInput.value))
  }

  emailValidate() {
    const isEmail = value => !!value && (new RegExp([
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))/,
      /@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ].map(part => part.source).join(''))).test(value);

    this.__els.emailButton.disabled = false === isEmail(this.__els.emailInput.value)
  }
}

customElements.define(EmailSubscriptionSetup.is, EmailSubscriptionSetup)
