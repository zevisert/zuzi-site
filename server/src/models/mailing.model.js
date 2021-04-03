/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import mongoose from 'mongoose';

export const MailingTopics = {
    orders: {
        etransfer: {
            accepted: {
                ref: "ORDERS:ETRANSFER:ACCEPTED",
                template: {
                    mjml: "mjml/etransfer/accepted.mjml.njk",
                    text: "plaintext/etransfer/accepted.text.njk"
                },
                subject: "Your payment to Zuzi Art has been accepted"
            },
            pending: {
                ref: "ORDERS:ETRANSFER:PENDING",
                template: {
                    mjml: "mjml/etransfer/pending.mjml.njk",
                    text: "plaintext/etransfer/pending.text.njk"
                },
                subject: "Next steps for your order from Zuzi Art"
            },
            rejected: {
                ref: "ORDERS:ETRANSFER:REJECTED",
                template: {
                    mjml: "mjml/etransfer/rejected.mjml.njk",
                    text: "plaintext/etransfer/rejected.text.njk"
                },
                subject: "Payment for your order on Zuzi Art has been rejected.",
            },
            admin: {
                generated: {
                    ref: "ORDERS:ETRANSFER:ADMIN:GENERATED",
                    template: {
                        mjml: "mjml/etransfer/admin/generated.mjml.njk",
                        text: "plaintext/etransfer/admin/generated.text.njk"
                    },
                    subject: "Order placed using E-Transfer"
                },
            },
        },
        stripe: {
            accepted: {
                ref: "ORDERS:STRIPE:ACCEPTED",
                template: {
                    mjml: "mjml/stripe/accepted.mjml.njk",
                    text: "plaintext/stripe/accepted.text.njk"
                },
                subject: "Your order from Zuzi Art"
            },
            failed: {
                ref: "ORDERS:STRIPE:FAILED",
                template: {
                    mjml: "mjml/stripe/failed.mjml.njk",
                    text: "plaintext/stripe/failed.text.njk"
                },
                subject: "Payment for your order on Zuzi Art failed.",
            },
            admin: {
                generated: {
                    ref: "ORDERS:STRIPE:ADMIN:GENERATED",
                    template: {
                        mjml: "mjml/stripe/admin/generated.mjml.njk",
                        text: "plaintext/stripe/admin/generated.text.njk"
                    },
                    subject: "Order placed using Stripe",
                },
                notprocessed: {
                    ref: "ORDERS:STRIPE:ADMIN:NOTPROCESSED",
                    template: {
                        mjml: "mjml/stripe/admin/notprocessed.mjml.njk",
                        text: "plaintext/stripe/admin/notprocessed.text.njk"
                    },
                    subject: "An order failed payment processing",
                },
            },
        },
    },
    subscribers: {
        newartwork: {
            ref: "SUBSCRIBERS:NEWARTWORK",
            template: {
                mjml: "mjml/subscribers/new-artwork.mjml.njk",
                text: "plaintext/subscribers/new-artwork.text.njk"
            },
            subject: "New artwork on Zuzi Art"
        },
    },
}


export const mailingSchema = new mongoose.Schema({
    completed: {
        type: Boolean,
        default: false,
        required: true
    },
    recipients: {
        type: [String],
        required: true,
        validate: {
            validator: function (value) {
                return value.length > 0;
            },
            message: () => `Mailing must have at least 1 recipient`
        }
    },
    topic: {
        type: String,
        enum: [
            MailingTopics.orders.etransfer.accepted.ref,
            MailingTopics.orders.etransfer.pending.ref,
            MailingTopics.orders.etransfer.rejected.ref,
            MailingTopics.orders.etransfer.admin.generated.ref,
            MailingTopics.orders.stripe.accepted.ref,
            MailingTopics.orders.stripe.failed.ref,
            MailingTopics.orders.stripe.admin.generated.ref,
            MailingTopics.orders.stripe.admin.notprocessed.ref,
            MailingTopics.subscribers.newartwork.ref,
        ]
    }
});

export const Mailing = mongoose.model('Mailing', mailingSchema);
