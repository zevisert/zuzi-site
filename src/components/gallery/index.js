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
import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store } from '../../store.js';

// These are the elements needed by this element.
import './gallery-list.js';

// These are the shared styles needed by this element.
import { SharedStyles } from '../shared-styles.js';
import { ButtonSharedStyles } from '../button-shared-styles.js';

class Gallery extends connect(store)(PageViewElement) {
  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}

      <section>
        <h2>Gallery</h2>

      </section>
      <section>
        <gallery-list></gallery-list>
      </section>
    `;
  }

  static get properties() { return {
    // This is the data from the store.
    _quantity: { type: Number },
    _error: { type: String },
  }}

  // This is called every time something is updated in the store.
  stateChanged(state) {

  }
}

window.customElements.define('gallery-view', Gallery);
