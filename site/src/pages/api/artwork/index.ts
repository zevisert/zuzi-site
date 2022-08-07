import type { NextApiRequest, NextApiResponse } from 'next';

import { get } from './_get';
import { patch } from './_patch';
import { post } from './_post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      await get(req, res);
      return;

    case 'POST':
      await post(req, res);
      return;

    case 'PATCH':
      await patch(req, res);
      return;
  }
}

// Stripe doesn't delete products and prices, just sets them inactive (for reconciliation purposes)
