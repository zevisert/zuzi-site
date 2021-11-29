/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { LitElement } from "lit";

export class PageViewElement extends LitElement {
  // Only render this page if it's actually visible.
  shouldUpdate() {
    return this.active;
  }

  static get properties() {
    return {
      active: { type: Boolean },
    };
  }
}
