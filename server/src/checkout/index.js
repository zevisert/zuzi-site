/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import {
    checkout as stripeCheckout,
    webhook as stripeWebhook
} from './stripe.js';

import {
    checkout as etransferCheckout,
    webhook as etransferWebhook
} from './etransfer.js';

export const checkout = {
    stripe: stripeCheckout,
    etransfer: etransferCheckout
};

export const webhook = {
    stripe: stripeWebhook,
    etransfer: etransferWebhook
};
