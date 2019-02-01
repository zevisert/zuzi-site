/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html, LitElement } from '@polymer/lit-element';

class DonutSpinner extends LitElement {
  render() {
    return html`
      <style>
        @keyframes donut-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .donut {
          display: inline-block;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #7983ff;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: donut-spin 1.2s linear infinite;
        }
      </style>

      <div id="donut" class="donut"></div>
    `;
  }
}

customElements.define('donut-spinner', DonutSpinner);
