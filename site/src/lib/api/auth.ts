import status from 'fastatus';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken, JWT } from 'next-auth/jwt';

export default async function authGuard(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<JWT | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    res.status(status.HTTP_401_UNAUTHORIZED).setHeader('WWW-Authenticate', 'Bearer');
    return null;
  }

  return token;
}
