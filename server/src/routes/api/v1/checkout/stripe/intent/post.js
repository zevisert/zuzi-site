import Stripe from "stripe";
import { Order, OrderItem, Customer } from "../../../../../../models/index.js";

const stripe = Stripe(process.env.STRIPE_SK);

export async function post(ctx) {
  const { amount, metadata } = ctx.request.body;

  const items = metadata.items.map(
    (item) =>
      new OrderItem({
        quantity: item.quantity,
        item: item.postId,
        pricing: item.pricingId,
      })
  );

  const order = new Order({
    items,
    type: "stripe",
    status: "pending",
    customer: new Customer(metadata.customer),
    date: Date.now(),
    totalCents: amount,
    info: metadata.info,
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    metadata: { order_id: order._id.toString() },
    currency: "cad",
    allowed_source_types: ["card"],
  });

  order.intent_id = paymentIntent.id;

  try {
    await order.save();
  } catch (errors) {
    ctx.throw(422, JSON.stringify({ errors: errors.errors }));
  }

  ctx.body = { client_secret: paymentIntent.client_secret };
}
