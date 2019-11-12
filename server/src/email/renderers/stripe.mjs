/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import { MailingTopics } from '../../models/mailing.model'
import { render, plaintext } from "../render.mjs"

/**
 * Stripe Order processed
 * @param context email rendering context
 */
export const orderAcceptedMessage = async context => {
    const topic = MailingTopics.orders.stripe.accepted;

    return {
        text:    plaintext(topic.template, context),
        from:    context.process.env.ORDERS_EMAIL,
        to:      context.order.customer.email,
        subject: topic.subject,
        attachment: [{
            data: await render(topic.template, context),
            alternative: true
        }]
    }
}

/**
 * Stripe Order failed
 * @param context email rendering context
 */
export const orderFailedMessage = async context => {
    const topic = MailingTopics.orders.stripe.failed;

    return {
        text:    plaintext(topic.template, context),
        from:    context.process.env.ORDERS_EMAIL,
        to:      context.order.customer.email,
        subject: topic.subject,
        attachment: [{
            data: await render(topic.template, context),
            alternative: true
        }]
    }
}

/**
 * Stripe Order generated
 * @param context email rendering context
 * @param admins List of Administrator emails
 */
export const orderAdminGeneratedMessage = async (context, admins) => {
    const topic = MailingTopics.orders.stripe.admin.generated;

    return {
        text:    plaintext(topic.template, context),
        from:    context.process.env.ORDERS_EMAIL,
        to:      admins.map(admin => admin.email).join(', '),
        subject: topic.subject,
        attachment: [{
            data: await render(topic.template, context),
            alternative: true
        }]
    }
}

/**
 * Stripe Order not processed
 * @param context email rendering context
 * @param admins List of Administrator emails
 */
export const orderAdminNotProcessedMessage = async (context, admins) => {
    const topic = MailingTopics.orders.stripe.admin.notprocessed;

    return {
        text:    plaintext(topic.template, context),
        from:    context.process.env.ORDERS_EMAIL,
        to:      admins.map(admin => admin.email).join(', '),
        subject: topic.subject,
        attachment: [{
            data: await render(topic.template, context),
            alternative: true
        }]
    }
}
