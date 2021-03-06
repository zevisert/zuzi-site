/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { LitElement, html } from 'lit-element';
import { store, connect } from "../../store";
import { showSnackbar, hideSnackbar } from "../../actions/app";

import '@material/mwc-icon';

class Timer {
  constructor(ms, callback) {
    this._remaining = ms;
    this._total = ms;
    this._timeout = null;
    this._started = null;

    this._callback = () => {
      this._remaining = 0;
      this._started = null;
      callback();
    };
  };

  reset() {
    this._remaining = this._total;
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
  }

  start() {
    this._started = Date.now();
    this._timeout = setTimeout(this._callback, this._remaining);
  }

  pause() {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
      const elapsed = this._started - Date.now();
      this._started = null;
      this._remaining -= elapsed;
    }
  }

  get remaining() {
    if (this._started !== null) {
      return Math.max(0, this._remaining - (this._started - Date.now()));
    } else {
      return 0;
    }
  }
}


class Snackbar extends connect(store)(LitElement) {

  static get is() { return 'app-snackbar'; }

  static get properties() { return {
    currentActiveState: {
      type: Boolean,
      reflect: true,
      attribute: 'active'
    },
    currentMessage: {
      type: String,
      attribute: 'message'
    }
  }}

  constructor() {
    super();
    this.__queue = [];
    this.__timer = new Timer(5000, this._hideMessage.bind(this));
  }

  render() {
    return html`
      <style>
        :host {
          position: fixed;
          width: 100%;
          height: 0;
          top: 100%;
        }

        :host([active]) .snackbar {
          transform: translateY(-100px);
          opacity: 1;
        }

        :host([active]) .snackbar::after {
          transform: scaleX(1);
          transition: transform 5s linear;
        }

        .snackbar {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 5px 15px;

          width: 90vw;
          max-width: 90vw;

          height: 3em;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 20px 0px rgba(0, 0, 0, 0.5);

          opacity: 0;
          transform: translateY(0px);
          transition: transform 0.5s ease, opacity 0.5s ease;
        }

        .snackbar span::first-letter {
          text-transform: capitalize;
        }

        .snackbar::after {
          content: '';
          background-color: red;
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: 0;
          left: 0;
          transform-origin: bottom left;
          transition: transform 0s linear;
        }

        mwc-icon {
          cursor: pointer;
        }

        /* Medium layout */
        @media only screen and (min-width: 640px) {
          .snackbar {
            width: 40vw;
            max-width: 600px;
          }
        }

      </style>
      <div class="snackbar">
        <span>${this.currentMessage}</span>
        <mwc-icon @click="${() => this._closeMessage()}">close</mwc-icon>
      </div>
    `;
  }

  firstUpdated() {
    const params = (new URL(document.location)).searchParams;
    if (params.has('message')) {
      store.dispatch(showSnackbar(params.get('message')));

      params.delete('message');
      const sep = [...params.keys()].length > 0
      history.replaceState({}, document.title, `${document.location.pathname}${sep ? '?' : ''}${params}`);
    }
  }

  stateChanged(state) {
    if (state.app.snackbar.active) {
      const hasMessageQueued = this.__queue.some(toast => toast.message === state.app.snackbar.message);
      if (! hasMessageQueued) {
        this.__queue.push(state.app.snackbar);
      }
    } else {
      // HIDE_SNACKBAR, remove from queue now
      this.__queue.shift();
    }
    this._showMessage();
  }

  _showMessage() {
    setTimeout(() => {
      if (this.__timer.remaining <= 0 && this.__queue.length > 0) {
        const savedState = this.__queue[0];
        this.currentMessage = savedState.message;
        this.currentActiveState = savedState.active;
        this.__timer.reset();
        this.__timer.start();
      }
    }, 500);


    if (this.__timer.remaining === 0) {
      this.currentMessage = '';
      this.currentActiveState = false;
    }
  }

  _closeMessage() {
    this.__timer.pause();
    store.dispatch(hideSnackbar());
  }

  _hideMessage() {
    store.dispatch(hideSnackbar());
  }
}

customElements.define(Snackbar.is, Snackbar);
