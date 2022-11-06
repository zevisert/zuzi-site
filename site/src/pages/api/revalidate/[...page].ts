import { description } from 'fastatus';
import { NextApiRequest, NextApiResponse } from 'next';

import authGuard from '@/lib/api/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (!(await authGuard(req, res))) {
    return res.send(description.HTTP_401_UNAUTHORIZED);
  }
  const { page: parts } = req.query;
  // Matched parameters will always be an array.
  const page = `/${(parts as string[]).join('/')}`;

  try {
    await res.revalidate(page);
    return res.json({ revalidated: true, page });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send(`Error revalidating ${page}: ${err}`);
  }
}
