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

// This element is connected to the Redux store.
import { store } from '../../store.js';

// We are lazy loading its reducer.
import shop from '../../reducers/shop.js';
store.addReducers({
  shop
});

// These are the elements needed by this element.
import './shop-cart.js';
import './shop-checkout.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';

class Cart extends PageViewElement {
  render() {
    return html`
      ${SharedStyles}
      <section>
        <h2>Shopping cart</h2>
      </section>

      <section>
        <shop-cart></shop-cart>
        <shop-checkout>
          <slot name="stripe-card" slot="stripe-card"></slot>
        </shop-checkout>
      </section>
    `;
  }

  static get properties() { return {

  }}
}

window.customElements.define('cart-view', Cart);
