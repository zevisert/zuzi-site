/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html } from '@polymer/lit-element';

export const ButtonSharedStyles = html`
<style>
  button {
    font-size: inherit;
    vertical-align: middle;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: 'Thasadith';

    border: 2px solid black;
    padding: 8px 16px;
  }

  button:disabled {
    border: 1px solid lightgray;
    cursor: not-allowed;
  }
</style>
`;
