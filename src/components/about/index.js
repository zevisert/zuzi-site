/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html } from '@polymer/lit-element';
import { PageViewElement } from '../page-view-element.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';

class About extends PageViewElement {
  render() {
    return html`
      ${SharedStyles}
      <style>

        :host {
          z-index: 0;
        }

        .title {
          font-family: "Kristi";
          font-size: 100px;
          font-weight: 100;
        }

        .about-img {
          max-width: 1200px;
          width: 100%;
        }

        section {
          font-size: xx-large;
        }

        article {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

      </style>
      <section>
        <article>
          <h2 class="title">Welcome to Zuzana Riha Art</h2>
          <img class="about-img" src="images/about-bg.jpg">
          <p>
            I'm Zuzana Riha, a multi-media artist from Revelstoke, BC.<br>
            <br>
            My wish for 2019 is that people can understand their connection to nature.<br>
            I believe that all beings are equal on this planet and we need to see eye to eye.<br>
            It’s a beautiful place we share with beautiful beings.<br>
            May you all find joy in your connections to the natural world this year!
          </p>
        </article>
      </section>
    `;
  }
}

window.customElements.define('about-view', About);
