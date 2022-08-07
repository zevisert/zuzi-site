import status from 'fastatus';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import Stripe from 'stripe';

import { toArtwork } from '@/lib/to-artwork';
import { Artwork } from '@/lib/types';

type Query = {
  [key: string]: undefined | string | string[];
};

type ApiResponse =
  | Stripe.ApiList<Artwork>
  | {
      error: { message: string };
    };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

// Not default, so this doesn't become /api/artwork/get instead of GET:/api/artwork
export async function get(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { limit, starting_after, ending_before }: Query = req.query;

  // Check limit
  if (typeof limit == 'string' && !/^[1-9]\d*$/.test(limit)) {
    res
      .status(status.HTTP_400_BAD_REQUEST)
      .json({ error: { message: 'Could not convert limit parameter to a number' } });
    return;
  } else if (Array.isArray(limit)) {
    res
      .status(status.HTTP_400_BAD_REQUEST)
      .json({ error: { message: 'Send only one option for the limit parameter' } });
    return;
  }

  // Check starting_after
  if (Array.isArray(starting_after)) {
    res
      .status(status.HTTP_400_BAD_REQUEST)
      .json({ error: { message: 'Send only one option for the starting_after parameter' } });
    return;
  }

  // Check ending_before
  if (Array.isArray(ending_before)) {
    res
      .status(status.HTTP_400_BAD_REQUEST)
      .json({ error: { message: 'Send only one option for the ending_before parameter' } });
    return;
  }

  const products = await stripe.products.list({
    limit: parseInt(limit ?? '10'),
    starting_after: starting_after,
    ending_before: ending_before,
    active:
      (await getToken({ req, secret: process.env.NEXTAUTH_SECRET })) !== null ? undefined : true,
  });

  res.status(status.HTTP_200_OK).json({
    object: products.object,
    has_more: products.has_more,
    url: products.url,
    data: products.data.map((product) => toArtwork(product)),
  });
}
