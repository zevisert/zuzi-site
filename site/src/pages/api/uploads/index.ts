import status, { description } from 'fastatus';
import { NextApiRequest, NextApiResponse } from 'next';
import getRawBody from 'raw-body';
import sharp from 'sharp';

import authGuard from '@/lib/api/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      res
        .status(status.HTTP_405_METHOD_NOT_ALLOWED)
        .json({ error: { message: 'Uploads enumeration is not allowed' } });
      return;

    case 'POST':
      if (!(await authGuard(req, res))) {
        return res.json({ error: { message: description.HTTP_401_UNAUTHORIZED } });
      } else {
        await post(req, res);
      }
      break;

    default:
      res
        .status(status.HTTP_405_METHOD_NOT_ALLOWED)
        .json({ error: { message: `${req.method} is not allowed` } });
      return;
  }
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  const img = sharp(await getRawBody(req));

  // TODO(zevisert): Convert, optimize, resize images, upload to CDN and return URL
  res.status(status.HTTP_202_ACCEPTED).json({ ok: true, info: await img.metadata() });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
