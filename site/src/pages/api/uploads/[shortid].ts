import status from 'fastatus';
import type { NextApiRequest, NextApiResponse } from 'next';

import authGuard from '@/lib/api/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      get(req, res);
      return;

    case 'PATCH':
      if (await authGuard(req, res)) {
        patch(req, res);
      }
      return;

    default:
      res
        .status(status.HTTP_405_METHOD_NOT_ALLOWED)
        .json({ error: { message: `${req.method} is not allowed` } });
      return;
  }
}

function get(req: NextApiRequest, res: NextApiResponse) {
  const { shortid } = req.query;
  res.redirect(
    302,
    `https://${process.env.CDN_SPACENAME}.${process.env.CDN_REGION}.${process.env.CDN_HOST}/${process.env.CDN_DIR}/${shortid}`
  );
}

function patch(req: NextApiRequest, res: NextApiResponse) {
  // TODO(zevisert): Like image POST handler, but for replace
  res
    .status(status.HTTP_501_NOT_IMPLEMENTED)
    .json({ error: { message: 'Image replacement is not implemented' } });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
