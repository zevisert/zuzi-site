/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { html } from "lit";
import { PageViewElement } from "../page-view-element.js";

// These are the shared styles needed by this element.
import { SharedStyles } from "../shared-styles.js";

class Virtual extends PageViewElement {
  static get is() {
    return "virtual-tour-page";
  }

  render() {
    return html`
      ${SharedStyles}
      <style>
        article {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: auto;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
          overflow: hidden;
          text-align: center;
        }

        iframe {
          overflow: hidden;
          height: 80vh;
          width: 100%;
        }
      </style>
      <section>
        <article>
          <span>November 2020 Art Show</span>
          <iframe
            width="100%"
            height="100%"
            src="https://my.matterport.com/show/?m=A8HFnGeF8Vz"
            frameborder="0"
            allowfullscreen
            allow="xr-spatial-tracking"
          >
          </iframe>
        </article>
      </section>
    `;
  }
}

window.customElements.define(Virtual.is, Virtual);
