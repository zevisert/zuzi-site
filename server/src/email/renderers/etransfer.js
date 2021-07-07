/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import { MailingTopics } from "../../models/mailing.model.js"
import { render, plaintext } from '../render.js'
/**
 * Customer E-Transfer order follow-up
 * @param context email rendering context
 */
export const orderPendingMessage = async context => {
    const topic = MailingTopics.orders.etransfer.pending;

    return {
        text: await plaintext(topic.template, context),
        from: context.process.env.ORDERS_EMAIL,
        to: context.order.customer.email,
        subject: topic.subject,
        attachment: [{
            data: await render(topic.template, context),
            alternative: true
        }]
    }
}

/**
 * E-Transfer Accepted
 * @param context email rendering context
 */
export const orderAcceptedMessage = async context => {
    const topic = MailingTopics.orders.etransfer.accepted;

    return {
        text: await plaintext(topic.template, context),
        from: context.process.env.ORDERS_EMAIL,
        to: context.order.customer.email,
        subject: topic.subject,
        attachment: [{
            data: await render(topic.template, context),
            alternative: true
        }]
    }
}

/**
 * E-Transfer order denied!
 * @param context email rendering context
 */
export const orderRejectedMessage = async context => {
    const topic = MailingTopics.orders.etransfer.rejected

    return {
        text: await plaintext(topic.template, context),
        from: context.process.env.ORDERS_EMAIL,
        to: context.order.customer.email,
        subject: topic.subject,
        attachment: [{
            data: await render(topic.template, context),
            alternative: true
        }]
    }
}

/**
 * E-Transfer order placed notification
 * @param context email rendering context
 * @param admins List of Administrator emails
 */
export const orderAdminGeneratedMessage = async (context, admins) => {
    const topic = MailingTopics.orders.etransfer.admin.generated;

    return {
        text: await plaintext(topic.template, context),
        from: context.process.env.ORDERS_EMAIL,
        to: admins.map(admin => admin.email).join(', '),
        subject: topic.subject,
        attachment: [{
            data: await render(topic.template, context),
            alternative: true
        }]
    }
}
