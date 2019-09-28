/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import {
    orderAcceptedPlaintext,
    orderFailedPlaintext,
    orderAdminGeneratedPlaintext,
    orderAdminNotProcessedPlaintext
} from "../plaintext/stripe.mjs"
import { render } from "../render.mjs"

/**
 * Stripe Order processed
 * @param context email rendering context
 */
export const orderAcceptedTemplate = context => {

    return {
        html:    render('stripe/accepted.mjml.njk', context),
        text:    orderAcceptedPlaintext(context),
        from:    context.process.env.ORDERS_EMAIL,
        to:      context.order.customer.email,
        subject: "Your order from Zuzi Art"
    }
}

/**
 * Stripe Order failed
 * @param context email rendering context
 */
export const orderFailedTemplate = context => {

    return {
        html:    render('stripe/failed.mjml.njk', context),
        text:    orderFailedPlaintext(context),
        from:    context.process.env.ORDERS_EMAIL,
        to:      context.order.customer.email,
        subject: "Payment for your order on Zuzi Art failed."
    }
}

/**
 * Stripe Order generated
 * @param context email rendering context
 * @param admins List of Administrator emails
 */
export const orderAdminGeneratedTemplate = (context, admins) => {
    return {
        html:    render('stripe/admin/generated.mjml.njk', context),
        text:    orderAdminGeneratedPlaintext(context),
        from:    context.process.env.ORDERS_EMAIL,
        to:      admins.map(admin => admin.email).join(', '),
        subject: "Order placed using stripe"
    }
}

/**
 * Stripe Order not processed
 * @param context email rendering context
 * @param admins List of Administrator emails
 */
export const orderAdminNotProcessedTemplate = (context, admins) => {
    return {
        html:    render('stripe/admin/notprocessed.mjml.njk', context),
        text:    orderAdminNotProcessedPlaintext(context),
        from:    context.process.env.ORDERS_EMAIL,
        to:      admins.map(admin => admin.email).join(', '),
        subject: "An order failed payment processing"
    }
}
