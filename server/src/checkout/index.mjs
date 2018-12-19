import {
    checkout as stripeCheckout,
    webhook as stripeWebhook
} from './stripe';

import {
    checkout as etransferCheckout,
    webhook as etransferWebhook
} from './etransfer';

export const checkout = {
    stripe: stripeCheckout,
    etransfer: etransferCheckout
};

export const webhook = {
    stripe: stripeWebhook,
    etransfer: etransferWebhook
};