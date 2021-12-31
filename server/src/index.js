/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 */

import koa from "koa";
import body from "koa-body";
import session from "koa-session";
import passport from "koa-passport";

// Must be first, side effects import process.env
import { db_connect, isProtected } from "./config.js";

import { User } from "./models/index.js";

import router, { notFound } from "./routes/index.js";

// Import event handlers
import "./events/new_artwork.js";

const app = new koa();

db_connect(app);

app.keys = [process.env.SECRET_KEY];

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(User.createStrategy());

const middleware = [
  ["404", notFound],
  ["session", session({ maxAge: "session" }, app)],
  [
    "body parser",
    body({
      multipart: true,
      includeUnparsed: true,
      formidable: { maxFileSize: Infinity },
    }),
  ],
  ["passport initialize", passport.initialize()],
  ["passport session", passport.session()],
  ["protected routes", isProtected],
];

for (const [key, value] of middleware) {
  value._name = key;
  app.use(value);
}

app.use(router.routes(), router.allowedMethods());

app.listen(process.env.PORT, "0.0.0.0", () => {
  const link = new URL(process.env.SITE_URL);
  link.port = process.env.PORT;
  console.log(`App server running. Visit ${link}`);
});
