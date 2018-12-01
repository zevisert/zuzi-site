import Stripe from 'stripe';

const stripe = Stripe(process.env.STRIPE_SK);

export async function checkout(ctx) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: ctx.query.amount,
    currency: 'cad',
    allowed_source_types: ['card']
  });

  ctx.body = { client_secret: paymentIntent.client_secret };
}
