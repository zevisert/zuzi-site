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

        .about-bg {
          background-image: url("images/about-bg.jpg");
          background-position: center;
          background-size: cover;
          position: fixed;
          left: 0;
          top: 85px;
          z-index: -1;
          min-height: 100vh;
          min-width: 100vw;
        }

        span {
          background-color: white;
          padding: 0 5px;
        }

        section {
          font-size: xx-large;
        }

      </style>
      <section>
        <h2><span>Welcome</span></h2>
        <p><span>I'm Zuzana Riha, a multi-media artist from Revelstoke, BC.</span></p>
        <p>
          <span>My wish for 2019 is that people can understand their connection to nature.</span><br>
          <span>I believe that all beings are equal on this planet and we need to see eye to eye.</span><br>
          <span>It’s a beautiful place we share with beautiful beings.</span><br>
          <span>May you all find joy in your connections to the natural world this year!</span>
        </p>
      </section>
      <div class="about-bg"></div>
    `;
  }
}

window.customElements.define('about-view', About);
