/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import Stripe from 'stripe';
import unparsed from 'koa-body/unparsed';

import { Order, OrderItem, Customer, User } from '../models';
import { email, withContext } from '../email';
import {
  orderAcceptedMessage,
  orderFailedMessage,
  orderAdminGeneratedMessage,
  orderAdminNotProcessedMessage
} from '../email/renderers/stripe';

const stripe = Stripe(process.env.STRIPE_SK);

export async function checkout(ctx) {

  const {amount, metadata, ...rest} = ctx.request.body;

  const items = metadata.items.map(item => new OrderItem({
    quantity: item.quantity,
    item: item.postId,
    pricing: item.pricingId
  }));

  const order = new Order({
    items,
    type: 'stripe',
    status: 'pending',
    customer: new Customer(metadata.customer),
    date: Date.now(),
    totalCents: amount,
    info: metadata.info
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    metadata: { order_id: order._id.toString() },
    currency: 'cad',
    allowed_source_types: ['card'],
  });

  order.intent_id = paymentIntent.id;

  try {
    await order.save();
  } catch (errors) {
    ctx.throw(422, JSON.stringify({ errors: errors.errors }));
  }

  ctx.body = { client_secret: paymentIntent.client_secret };
}

export async function webhook(ctx) {
  const sig = ctx.request.header['stripe-signature'];
  let event = null;

  try {
    event = stripe.webhooks.constructEvent(ctx.request.body[unparsed], sig, process.env.STRIPE_WHSEC);
  } catch (err) {
    // invalid signature
    console.log(err.message);
    ctx.throw(400, 'invalid_signature');
  }

  console.log(event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;

        const order = await Order.findById(intent.metadata.order_id)
          .populate({path: 'items.item', select: "title description preview slug"})
          .populate({path: 'items.pricing'});

        order.status = 'paid';

        if (
          intent.charges &&
          intent.charges.data &&
          intent.charges.object === "list" &&
          intent.charges.data.length === 1
        ) {
          order.receipt = intent.charges.data[0].receipt_url
        }

        await order.save()

        await email.deliver(orderAdminGeneratedMessage(
          withContext({
            headline: "Newly placed order completed",
            delivery_reason: [
              "This message was generated in response to order placement.",
              "Payment processing has completed successfully, thus the associated order has been accepted.",
              "You are a recipient because this email is listed as a store administrator."
            ].join(" ")
          }, order),
          await User.find({ admin: true })
        ));

        await email.deliver(orderAcceptedMessage(
          withContext({
            headline: "Payment Completed",
            delivery_reason: [
              "This message was generated in response to a status change of recently placed order associated with this email address.",
              "Payment processing has completed successfully, and the associated order has been accepted."
            ].join(" ")
          }, order)
        ));

        console.log('Stripe processed order for:', order.customer.name);
        order.mailings
        await order.save();

        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;

        const order = await Order.findById(intent.metadata.order_id)
          .populate({path: 'items.item', select: "title description slug preview"})
          .populate({path: 'items.pricing'});

        order.status = 'failed';
        if (intent.last_payment_error) {
          order.info = intent.last_payment_error.message;
        }

        await email.deliver(orderFailedMessage(
          withContext({
            headline: "Payment processing failed",
            delivery_reason: [
              "This message was generated in response to placement of an order using this email address.",
              "The associated order can not be completed because the payment method was refused."
            ].join(" ")
          }, order)
        ));

        await email.deliver(orderAdminNotProcessedMessage(
          withContext({
            headline: "Order payment failed",
            delivery_reason: [
              "This message was generated in response to a recently placed order that did not successfully complete payment.",
              "Upstream payment processing by Stripe refused to create a charge for this transaction, the customer may try again later.",
              "You are receiving notification because this email is listed as a store administrator."
            ].join(" ")
          }, order),
          await User.find({ admin: true })
        ));

        console.log('Stripe failed payment for:', order.customer.email, order.info);

        await order.save();
        break;
      }
      default: {
        break;
      }
    }
  } catch (err) {
    console.log(err);
    ctx.status = 400;
    ctx.body = 'errored';
  } finally {
    if (! ctx.status) {
      ctx.status = 200;
    }
    if (! ctx.body) {
      ctx.body = 'received';
    }
  }
}
