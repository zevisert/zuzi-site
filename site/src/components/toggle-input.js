/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html, LitElement } from 'lit';

class ToggleInput extends LitElement {

  static get is() { return 'toggle-input'; }

  static get properties() { return {
    type: { type: String },
    checked: { type: Boolean, reflect: true } ,
    value: { type: String },
    error: { type: Boolean, reflect: true }
  }}

  constructor() {
    super();
    this.type = 'checkbox';
    this.checked = false;
    this.value = null;
    this.error = false;
  }

  render() {
    return html`
      <style>
        .switch {
          position: relative;
          display: inline-block;
          width: 46px;
          height: 22px;
          background-color: rgba(0, 0, 0, 0.25);
          border-radius: 20px;
          transition: all 0.3s;
          top: 5px;
        }

        .switch::after {
          content: '';
          position: absolute;
          width: 22px;
          height: 18px;
          border-radius: 18px;
          background-color: white;
          top: 2px;
          left: 2px;
          transition: all 0.3s;
        }

        input[type='checkbox']:checked + .switch::after {
          transform: translateX(20px);
        }

        input[type='checkbox']:checked + .switch {
          background-color: darkcyan;
        }

        .offscreen {
          position: absolute;
          left: -9999px;
        }
      </style>

      <input id="toggle" class="offscreen" .type="${this.type}" .checked="${this.checked}" .value="${this.value}"/>
      <label for="toggle" class="switch"></label>
    `;
  }

  firstUpdated() {
    this.__els = {
      input: this.renderRoot.getElementById('toggle')
    };

    [ this.__els.input
    ].forEach(elem => {
      elem.addEventListener('change', this.__updateValue.bind(this));
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    [ this.__els.input
    ].forEach(elem => {
      elem.removeEventListener('change', this.__updateValue.bind(this));
    });
  }

  __updateValue(e) {
    const target = e.target;
    this.checked = target.checked;
    this.dispatchEvent(
      new CustomEvent('changed', {
        composed: true,
        detail: {
          checked: this.checked
        }
      })
    );
  }
}

customElements.define(ToggleInput.is, ToggleInput);
