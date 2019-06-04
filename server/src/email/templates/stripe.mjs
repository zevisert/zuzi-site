/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

/**
 * Stripe Order processed
 * @param order Mongoose order model
 */
export const orderSuccessTemplate = order => {

    const text =
`Thank you for your order!

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
        subject: "Your order from Zuzi Art"
    }
}
