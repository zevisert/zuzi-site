// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

export default withSentry(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.setHeader('Content-Type', 'text/plain');
    res.status(405).end('Method Not Allowed');
    return;
  }

  if ('application/json' !== req.headers['content-type']) {
    res.setHeader('Accept', 'application/json, text/html');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', 'text/plain');
    res.status(406).end(`Content type ${req.headers['content-type']} not supported`);
    return;
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = req.body.line_items;

  const querySuccess = new URLSearchParams({ result: 'success' });
  line_items.map((item) => item.price && querySuccess.append('items', item.price));

  try {
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/thank-you?${querySuccess.toString()}`,
      cancel_url: `${req.headers.origin}/cart?result=cancelled`,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
    });

    res.status(201).json({ redirected: true, url: session.url });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      res.status(err.statusCode || 500).json(err.message);
    } else {
      throw err;
    }
  }
});
