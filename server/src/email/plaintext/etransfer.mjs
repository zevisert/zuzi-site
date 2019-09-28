import dedent from "dedent"

/**
 * Customer E-Transfer order follow-up
 * @param context email rendering context
 */
export const orderPendingPlaintext = context => dedent`
    Your e-transfer order is awaiting your payment

    What's next?
    When accepting orders paid with e-transfers, we keep your order in a pending state until payment is received.

    To complete your order, visit your financial institution's website and place an e-transfer using the following information:

    ---
    Recipient email address:    ${context.process.env.ETRANSFER_EMAIL}
    Security question:          Art Store Security Phrase
    Secret phrase (password):   ${context.process.env.ETRANSFER_PW}
    Amount:                     $${(context.order.totalCents / 100).toFixed(2)} CAD
    Description (optional):     Order# ${context.order._id}
    ---

    To confirm, you ordered:
    ${context.order.items.map(orderItem => { return `
        - ${orderItem.quantity}x ${orderItem.item.title} $${orderItem.pricing.price}
            | size: ${orderItem.pricing.size.width} by ${orderItem.pricing.size.height} ${orderItem.pricing.size.unit}
            | type: ${orderItem.pricing.medium}`
    }).join('\n')}

    The shipping address received is:

    ${context.order.customer.name}
    ${context.order.customer.shipping.address_lines.join(',')}
    ${context.order.customer.shipping.locality}, ${context.order.customer.shipping.region}
    ${context.order.customer.shipping.country}, ${context.order.customer.shipping.postal_code}


    If anything is wrong with the above, please forward this email to ${process.env.SUPPORT_EMAIL}.
    Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
    `;


/**
 * Customer E-Transfer order follow-up
 * @param context email rendering context
 */
export const orderAcceptedPlaintext = context => dedent`
    Your e-transfer order has been accepted

    Thank you for your support!
    Your purchase helps me buy canvas, paints, brushes, prints, get professional digitization, and otherwise make time for artwork. It's very appreciated, your order will be delivered soon!

    You ordered:
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

    Thanks for ordering from ${context.process.env.SITE_URL}!


    If anything is wrong with the above, please forward this email to ${context.process.env.SUPPORT_EMAIL}.
    Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
    `;


/**
 * Customer E-Transfer order rejected
 * @param context email rendering context
 */
export const orderRejectedPlaintext = context => dedent`
    Your e-transfer order has been cancelled

    What's going on?
    Sometimes we have to cancel orders placed with e-transfers;
    it could be that you seem to have forgotten to send payment, perhaps the wrong payment amount was sent, or the wrong password (secret phrase) was used.

    In any case, while cancelling your order, the following message was provided:
    ---
    ${context.order.info}
    ---

    For reference, your order for the following has been cancelled:
    ${context.order.items.map(orderItem => { return `
        - ${orderItem.quantity}x ${orderItem.item.title} $${orderItem.pricing.price}
            | size: ${orderItem.pricing.size.width} by ${orderItem.pricing.size.height} ${orderItem.pricing.size.unit}
            | type: ${orderItem.pricing.medium}`
    }).join('\n')}

    If anything is wrong with the above, please forward this email to ${context.process.env.SUPPORT_EMAIL}.
    Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
    `;

/**
 * Customer E-Transfer order generated
 * @param context email rendering context
 */
export const orderAdminGeneratedPlaintext = context => dedent`
    New e-transfer order placed

    Wait for payment
    The system has generated an order but it should remain in a pending state until you receive payment via etransfer from the person listed below.

    When payment is received, remember to visit the order admin page and confirm the customer's order so that they get their confirmation email!

    ===
    Order Information                 (Admin viewable only)
      Customer name              ${context.order.customer.name}
      Customer email address     ${context.order.customer.email}
      Customer address           ${context.order.customer.shipping.address_lines.map(line => {
        return dedent`
        |                             ${line}
        `
    })}
    |                            ${context.order.customer.shipping.locality}, ${context.order.customer.shipping.region}
    |                            ${context.order.customer.shipping.country} - ${context.order.customer.shipping.postal_code}

      Amount                     $${(order.totalCents / 100).toFixed(2)} CAD
      Order Admin Page           ${context.process.env.SITE_URL}/admin/orders/${order._id}
    ===
    ===
    E-Transfer Information            (Shown to customer)
      Recipient email address    ${context.process.env.ETRANSFER_EMAIL}
      Security question          Art Store Security Phrase
      Secret phrase (password)   ${context.process.env.ETRANSFER_PW}
      Amount                     $${(order.totalCents / 100).toFixed(2)} CAD
      Description (optional)     Order# ${order._id}
    ===


    The customer ordered:
    ${context.order.items.map(orderItem => { return `
        - ${orderItem.quantity}x ${orderItem.item.title} $${orderItem.pricing.price}
            | size: ${orderItem.pricing.size.width} by ${orderItem.pricing.size.height} ${orderItem.pricing.size.unit}
            | type: ${orderItem.pricing.medium}`
    }).join('\n')}

    If anything is wrong with the above, please forward this email to ${context.process.env.SUPPORT_EMAIL}.
    Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
    `;
