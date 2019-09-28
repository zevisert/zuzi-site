/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import Stripe from 'stripe';
import { Order, OrderItem, Customer } from '../models';
import { email } from '../email';
import { orderAcceptedTemplate, orderFailedTemplate } from '../email/templates/stripe';

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
    event = stripe.webhooks.constructEvent(ctx.request.rawBody, sig, process.env.STRIPE_WHSEC);
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
          .populate({path: 'items.item', select: "title description"})
          .populate({path: 'items.pricing'});

        order.status = 'paid';
        await email.deliver(orderAcceptedTemplate(order));

        console.log('Stripe processed order for:', order.customer.name);
        await order.save();

        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;

        const order = await Order.findById(intent.metadata.order_id)
          .populate({path: 'items.item', select: "title description"})
          .populate({path: 'items.pricing'});

        order.status = 'failed';
        if (intent.last_payment_error) {
          order.info = intent.last_payment_error.message;
        }

        await email.deliver(orderFailedTemplate(order));
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
    ctx.body = 'errored';
  } finally {
    ctx.status = 200;
    if (! ctx.body) {
      ctx.body = 'received';
    }
  }
}
