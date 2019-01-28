import Stripe from 'stripe';
import { Order, OrderItem, Customer } from '../models';
import { email } from '../email';
import { orderSuccessTemplate } from '../email/templates/stripe';

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
        await email.deliver(orderSuccessTemplate(order));
        
        console.log('Stripe processed order for:', order.customer.name);
        await order.save();

        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        const message = intent.last_payment_error && intent.last_payment_error.message;
        console.log('Stripe failed:', intent.id, message);
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
