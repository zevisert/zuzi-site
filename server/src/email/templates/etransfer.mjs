/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import {
    orderPendingPlaintext,
    orderAcceptedPlaintext,
    orderRejectedPlaintext,
    orderAdminGeneratedPlaintext,

} from "../plaintext/etransfer.mjs"

import { render } from '../render.mjs'
/**
 * Customer E-Transfer order follow-up
 * @param context email rendering context
 */
export const orderPendingTemplate = context => {

    return {
        html:    render('etransfer/pending.mjml.njk', context),
        text:    orderPendingPlaintext(context),
        from:    context.process.env.ORDERS_EMAIL,
        to:      context.order.customer.email,
        subject: "Next steps for your order from Zuzi Art"
    }
}

/**
 * E-Transfer Accepted
 * @param context email rendering context
 */
export const orderAcceptedTemplate = context => {

    return {
        html:    render('etransfer/accepted.mjml.njk', context),
        text:    orderAcceptedPlaintext(context),
        from:    context.process.env.ORDERS_EMAIL,
        to:      context.order.customer.email,
        subject: "Your payment to Zuzi Art has been accepted"
    }
}

/**
 * E-Transfer order denied!
 * @param context email rendering context
 */
export const orderRejectedTemplate = context => {

    return {
        html:    render('etransfer/rejected.mjml.njk', context),
        text:    orderRejectedPlaintext(context),
        from:    context.process.env.ORDERS_EMAIL,
        to:      context.order.customer.email,
        subject: "Payment for your order on Zuzi Art has been rejected."
    }
}

/**
 * E-Transfer order placed notification
 * @param context email rendering context
 * @param admins List of Administrator emails
 */
export const orderAdminGeneratedTemplate = (context, admins) => {

    return {
        html:    render('etransfer/admin/generated.mjml.njk', context),
        text:    orderAdminGeneratedPlaintext(context),
        from:    context.process.env.ORDERS_EMAIL,
        to:      admins.map(admin => admin.email).join(', '),
        subject: "Order placed using e-transfer"
  }
}
