/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

/**
 * Customer E-Transfer order follow-up
 * @param order Mongoose order model
 */
export const orderPendingTemplate = order => {
    const text =
`Thank you for your order, but one more thing...

As you selected e-transfer as your payment method, your order is pending until your e-transfer is accepted.
Please send payment of $${(order.totalCents / 100).toFixed(2)} to ${process.env.ETRANSFER_EMAIL}, and use the phrase "${process.env.ETRANSFER_PW}" as the answer to the secret question.

To confirm, you ordered:
${order.items.map(orderItem => { return `
    - ${orderItem.quantity}x ${orderItem.item.title} $${orderItem.pricing.price}
        | size: ${orderItem.pricing.size.width} by ${orderItem.pricing.size.height} ${orderItem.pricing.size.unit}
        | type: ${orderItem.pricing.medium}`
}).join('\n')}

... and the shipping address is:

${order.customer.name}
${order.customer.shipping.address_lines.join(',')}
${order.customer.shipping.locality}, ${order.customer.shipping.region}
${order.customer.shipping.country}, ${order.customer.shipping.postal_code}


If anything is wrong with the above, please forward this email to ${process.env.SUPPORT_EMAIL}.
Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
`;

    return {
        text:    text,
        from:    process.env.ORDERS_EMAIL,
        to:      order.customer.email,
        subject: "Next steps for your order from Zuzi Art"
    }
}

/**
 * E-Transfer Accepted
 * @param order Mongoose order model
 */

export const orderAcceptedTemplate = order => {
    const text =
`Thank you for your payment. Your e-transfer has been confirmed.

You ordered:
${order.items.map(orderItem => { return `
    - ${orderItem.quantity}x ${orderItem.item.title} $${orderItem.pricing.price}
        | size: ${orderItem.pricing.size.width} by ${orderItem.pricing.size.height} ${orderItem.pricing.size.unit}
        | type: ${orderItem.pricing.medium}`
}).join('\n')}

... and we will be shipping it to:

${order.customer.name}
${order.customer.shipping.address_lines.join(',')}
${order.customer.shipping.locality}, ${order.customer.shipping.region}
${order.customer.shipping.country}, ${order.customer.shipping.postal_code}

Thanks for ordering from ZuzanaRiha.art!


If anything is wrong with the above, please forward this email to ${process.env.SUPPORT_EMAIL}.
Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
`;

    return {
        text:    text,
        from:    process.env.ORDERS_EMAIL,
        to:      order.customer.email,
        subject: "Your payment to Zuzi Art has been accepted"
    }
}

/**
 * E-Transfer order denied!
 * @param order Mongoose order model
 * @param reason String representing why the order was denied
 */
export const orderRejectedTemplate = (order, reason) => {
    const text =
`
${reason}

Your e-transfer payment was rejected. Please try placing another order.

Your ordered for the following has been suspended:
${order.items.map(orderItem => { return `
    - ${orderItem.quantity}x ${orderItem.item.title} $${orderItem.pricing.price}
        | size: ${orderItem.pricing.size.width} by ${orderItem.pricing.size.height} ${orderItem.pricing.size.unit}
        | type: ${orderItem.pricing.medium}`
}).join('\n')}

If anything is wrong with the above, please forward this email to ${process.env.SUPPORT_EMAIL}.
Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
`;

    return {
        text:    text,
        from:    process.env.ORDERS_EMAIL,
        to:      order.customer.email,
        subject: "Payment for your order on Zuzi Art has been rejected."
    }
}

/**
 * E-Transfer order placed notification
 * @param order Mongoose order model
 * @param admins List of Administrator emails
 */
export const orderGeneratedTemplate = (order, admins) => {
    const text =
`An order using e-transfer has been created. Wait until the payment ( $${(order.totalCents / 100).toFixed(2)} ) arrives, then visit this link to confirm the order.

${process.env.SITE_URL}/admin/orders/${order._id}

The customer ordered:
${order.items.map(orderItem => { return `
    - ${orderItem.quantity}x ${orderItem.item.title} $${orderItem.pricing.price}
        | size: ${orderItem.pricing.size.width} by ${orderItem.pricing.size.height} ${orderItem.pricing.size.unit}
        | type: ${orderItem.pricing.medium}`
}).join('\n')}

... and their shipping address is:

${order.customer.name}
${order.customer.shipping.address_lines.join(',')}
${order.customer.shipping.locality}, ${order.customer.shipping.region}
${order.customer.shipping.country}, ${order.customer.shipping.postal_code}


If anything is wrong with the above, please forward this email to ${process.env.SUPPORT_EMAIL}.
Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
`;

  return {
    text: text,
    from: process.env.ORDERS_EMAIL,
    to: admins.map(admin => admin.email).join(', '),
    subject: "Order placed using e-transfer"
  }
}
