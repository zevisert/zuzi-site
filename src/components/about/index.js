/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html } from 'lit-element';
import { PageViewElement } from '../page-view-element.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';

import { store, connect } from '../../store.js';
import { getAboutText } from '../../actions/app.js';

class About extends connect(store)(PageViewElement) {

  static get is() { return 'about-page'; }

  static get properties() {
    return {
      __lines: { type: Array }
    }
  }

  constructor() {
    super();
    this.__lines = [];
  }

  render() {
    return html`
      ${SharedStyles}
      <style>
        .title {
          font-family: "Syncopate";
          font-size: 70px;
          font-weight: 100;
        }

        .about-img {
          max-width: 1200px;
          width: 100%;
        }

        .about-video {
          max-width: 1200px;
          width: 100%;
          /* 16:9 aspect ratio */
          padding-top: calc(100% * 9 / 16);
          position: relative;
        }

        .about-video > iframe {
          position: absolute;
          top: 0; 
          left: 0;
          height: 100%;
          width: 100%;
        }

        section {
          font-size: xx-large;
        }

        article {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

      </style>
      <section>
        <article>
          <h2 class="title">Welcome to <br>Zuzana Riha Art</h2>
          <img class="about-img" src="images/about-bg.jpg">

          <p>
            ${this.__lines.map(line => html`${line}<br>`)}
          </p>

          <div class="about-video">
            <iframe
              allowfullscreen
              src="https://player.vimeo.com/video/472820112"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
            ></iframe>
          </div>
        </article>
      </section>
    `;
  }

  firstUpdated() {
    store.dispatch(getAboutText());
  }

  stateChanged(newState) {
    this.__lines = newState.app.about.lines;
  }
}

window.customElements.define('about-view', About);
