
import dedent from "dedent"

/**
 * Customer stripe order follow-up
 * @param context email rendering context
 */
export const orderAcceptedPlaintext = context => dedent`
    Your order has been received

    Thank you for your support!
    Your purchase helps me buy canvas, paints, brushes, prints, get professional digitization, and otherwise make time for artwork. It's very appreciated, your order will be delivered soon!

    Order items:
    ${context.order.items.map(orderItem => { return `
        - ${orderItem.quantity}x ${orderItem.item.title} $${orderItem.pricing.price}
            | size: ${orderItem.pricing.size.width} by ${orderItem.pricing.size.height} ${orderItem.pricing.size.unit}
            | type: ${orderItem.pricing.medium}`
    }).join('\n')}

    We'll be delivering your order to:
    ${context.order.customer.name}
    ${context.order.customer.shipping.address_lines.join(',')}
    ${context.order.customer.shipping.locality}, ${context.order.customer.shipping.region}
    ${context.order.customer.shipping.country}, ${context.order.customer.shipping.postal_code}

    If anything is wrong with the above, please forward this email to ${process.env.SUPPORT_EMAIL}.
    Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
    `;

/**
 * Customer stripe order follow-up
 * @param context email rendering context
 */
export const orderFailedPlaintext = context => dedent`
    Your payment could not be processed

    Our payment processing service could not charge you; this is usually due to insufficient funds, or a limit on the maximum charge your payment method allows.

    In any case, the following message was provided:
    ---
    ${context.order.info}
    ---

    Here's the items you tried to order:
    ${context.order.items.map(orderItem => { return `
        - ${orderItem.quantity}x ${orderItem.item.title} $${orderItem.pricing.price}
            | size: ${orderItem.pricing.size.width} by ${orderItem.pricing.size.height} ${orderItem.pricing.size.unit}
            | type: ${orderItem.pricing.medium}`
    }).join('\n')}

    This is shipping info received:
    ${context.order.customer.name}
    ${context.order.customer.shipping.address_lines.join(',')}
    ${context.order.customer.shipping.locality}, ${context.order.customer.shipping.region}
    ${context.order.customer.shipping.country}, ${context.order.customer.shipping.postal_code}

    If anything is wrong with the above, please forward this email to ${process.env.SUPPORT_EMAIL}.
    Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
    `;


/**
 * Admin stripe order follow-up
 * @param context email rendering context
 */
export const orderAdminGeneratedPlaintext = context => dedent`
    Order generated!

    The stripe platform charges credit cards directly, so the customer should have been charged already.
    You can confirm on the stripe dashboard, and also check the date of the next payout from there too.

    https://dashboard.stripe.com/payments

    The customer's order information:
    ${context.order.items.map(orderItem => { return `
        - ${orderItem.quantity}x ${orderItem.item.title} $${orderItem.pricing.price}
            | size: ${orderItem.pricing.size.width} by ${orderItem.pricing.size.height} ${orderItem.pricing.size.unit}
            | type: ${orderItem.pricing.medium}`
    }).join('\n')}

    The customer's shipping address is:
    ${context.order.customer.name}
    ${context.order.customer.shipping.address_lines.join(',')}
    ${context.order.customer.shipping.locality}, ${context.order.customer.shipping.region}
    ${context.order.customer.shipping.country}, ${context.order.customer.shipping.postal_code}

    If anything is wrong with the above, please forward this email to ${process.env.SUPPORT_EMAIL}.
    Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
    `;

/**
 * Admin stripe order failed
 * @param context email rendering context
 */
export const orderAdminNotProcessedPlaintext = context => dedent`

    The customer's order has been cancelled, and they have been notified.

    The stripe platform charges credit cards directly, but the customer's card was declined.
    You can see more information on the stripe dashboard.

    Stripe provided the following message:
    ---
    ${context.order.info}
    ---

    https://dashboard.stripe.com/payments

    ${context.order.items.map(orderItem => { return `
        - ${orderItem.quantity}x ${orderItem.item.title} $${orderItem.pricing.price}
            | size: ${orderItem.pricing.size.width} by ${orderItem.pricing.size.height} ${orderItem.pricing.size.unit}
            | type: ${orderItem.pricing.medium}`
    }).join('\n')}

    The shipping address provided was:
    ${context.order.customer.name}
    ${context.order.customer.shipping.address_lines.join(',')}
    ${context.order.customer.shipping.locality}, ${context.order.customer.shipping.region}
    ${context.order.customer.shipping.country}, ${context.order.customer.shipping.postal_code}

    If anything is wrong with the above, please forward this email to ${process.env.SUPPORT_EMAIL}.
    Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
    `;
