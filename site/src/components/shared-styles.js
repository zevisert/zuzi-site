/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { html } from "lit";

export const SharedStyles = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    /* Add other styles shared across multiple components here */

    .offscreen {
      border: 0;
      clip: rect(0 0 0 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
      background-color: rgba(0, 0, 0, 0.25);
      border-radius: 20px;
      transition: all 0.3s;
    }

    .switch::after {
      content: "";
      position: absolute;
      width: 18px;
      height: 18px;
      border-radius: 18px;
      background-color: white;
      top: 1px;
      left: 1px;
      transition: all 0.3s;
    }

    input[type="checkbox"]:checked + .switch::after {
      transform: translateX(20px);
    }

    input[type="checkbox"]:checked + .switch {
      background-color: #7983ff;
    }
  </style>
`;
