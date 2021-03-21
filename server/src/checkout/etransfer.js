/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import { email, withContext } from '../email/index.js';
import { Order, OrderItem, Customer, User } from '../models/index.js';
import {
  orderPendingMessage,
  orderAcceptedMessage,
  orderRejectedMessage,
  orderAdminGeneratedMessage
} from '../email/renderers/etransfer.js';

export async function checkout(ctx) {

  const { amount, metadata, ...rest } = ctx.request.body;

  const items = metadata.items.map(item => new OrderItem({
    quantity: item.quantity,
    item: item.postId,
    pricing: item.pricingId
  }));

  const new_order = new Order({
    items,
    type: 'etransfer',
    status: 'pending',
    customer: new Customer(metadata.customer),
    date: Date.now(),
    totalCents: amount,
    info: metadata.info
  });

  try {
    await new_order.save();
  } catch (errors) {
    ctx.throw(422, JSON.stringify({ errors: errors.errors }));
  }

  try {

    const order = await Order.findById(new_order._id)
      .populate({path: 'items.item', select: "title description preview slug"})
      .populate({path: 'items.pricing'});

    // Email the customer
    await email.deliver(orderPendingMessage(
      withContext({
        headline: "Pending Order",
        delivery_reason: "This message was automatically generated in response to a recently placed order using this email address."
      }, order)
    ));

    // Email the admins
    await email.deliver(orderAdminGeneratedMessage(
      withContext({
        headline: "Newly placed order",
        delivery_reason: [
          "This message was automatically generated in response to a recently placed order.",
          "You are a recipient because this email address is listed as a store administrator."
        ].join(" ")
      }, order),
      await User.find({ admin: true })
    ));

    ctx.body = { success: true };

  } catch (errors) {
    console.error(errors);
    ctx.throw(400, JSON.stringify({ errors: errors.errors }));
  } finally {
    if (!ctx.body || !ctx.body.success) {
      await Order.deleteOne({ _id: new_order._id });
    }
  }
}

export async function webhook(ctx) {
  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  const { accepted, orderId } = ctx.request.body;

  const order = await Order.findOne({ _id: orderId, status: "pending" })
    .populate({path: 'items.item', select: "title description preview slug"})
    .populate({path: 'items.pricing'});

  if (!order) {
    ctx.throw(400, JSON.stringify({error: `Order does not exist or is not pending`}));
  }

  if (accepted) {

    order.status = 'paid';

    // Email the customer
    await email.deliver(orderAcceptedMessage(
      withContext({
        headline: "Order Accepted",
        delivery_reason: [
          "This message was generated in response to an update to the status of an order associated with this email address.",
          "Interac E-transfer based payment for the associated order has been accepted."
        ].join(" ")
      }, order)
    ));

    await order.save();
    ctx.body = { order };

  } else {

    const { reason } = ctx.request.body;
    if (reason) {
      order.status = 'rejected';
      order.info = reason;

      // Email the customer
      await email.deliver(orderRejectedMessage(
        withContext({
          headline: "Rejected Order",
          delivery_reason: [
            "This message was generated in response to an update to the status of an order associated with this email address.",
            "The associated order has been rejected, an no further processing will occur."
          ].join(" ")
        }, order)
      ));

      await order.save();
      ctx.body = { order };
    } else {
      ctx.throw(400, JSON.stringify({ error: 'Rejected order must have a reason'}));
    }
  }
}
