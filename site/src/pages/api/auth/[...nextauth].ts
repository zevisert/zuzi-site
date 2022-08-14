import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const prisma = new PrismaClient();

function getOptions(_req: NextApiRequest): NextAuthOptions {
  return {
    // For storing user info in the DB
    adapter: PrismaAdapter(prisma),
    callbacks: {
      // For denying sign-ins/ups
      async signIn({
        user,
        account: _account,
        profile: _profile,
        email: _email,
        credentials: _credentials,
      }) {
        const isAllowedToSignIn = ['coder@zuzi.art'].includes(user.email ?? '');
        if (isAllowedToSignIn) {
          return true;
        } else {
          // Return false to display a default error message
          return false;
          // Or you can return a URL to redirect to:
          // return '/unauthorized'
        }
      },
      // For altering JWE claims
      async jwt({
        token,
        user: _user,
        isNewUser: _isNewUser,
        account: _account,
        profile: _profile,
      }) {
        return token;
      },
      // For exposing JWE claims to the client
      async session({ session, token: _token, user: _user }) {
        return session;
      },
    },
    // JWE options
    session: {
      strategy: 'jwt',
      maxAge: 12 * 60 * 60,
    },
    // Where credentials are found
    providers: [
      CredentialsProvider({
        // The name to display on the sign in form (e.g. "Sign in with...")
        name: 'Credentials',
        // The credentials is used to generate a suitable form on the sign in page.
        // You can specify whatever fields you are expecting to be submitted.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: {
          email: { label: 'E-Mail Address', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials, _req) {
          // Add logic here to look up the user from the credentials supplied
          if (credentials?.email == 'coder@zuzi.art') {
            const match = await bcrypt.compare(
              credentials?.password,
              '$2a$12$SH3Amxhf4ZZvIjDvalbZeO48kj8o2XIPPPooCM8auF9Rr3N0RsSjS'
            );
            if (match) {
              return { id: 1337, name: 'Developer', email: 'coder@zuzi.art' };
            }
          }
          return null;
        },
      }),
    ],
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, getOptions(req));
}
