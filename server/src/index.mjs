/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import koa from 'koa';
import body from 'koa-body';
import session from 'koa-session';
import router from 'koa-router';
import multer from 'koa-multer';
import passport from 'koa-passport';

// Must be first, side effects import process.env
import { db_connect, pipe, isProtected } from './config';

import { User } from './models';

import {
  index,
  create,
  show,
  update,
  destroy,
  notFound,
  info,
  env,
  about,
  uploads,
  changePassword,
  createSubscriberUser
} from './routes';

import { checkout, webhook } from './checkout';

const app = new koa();

db_connect(app);

app.keys = [process.env.SECRET_KEY];

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(User.createStrategy());

const middleware = [
  ["404", notFound],
  ["session", session({maxAge: 'session'}, app)],
  ["body parser", body({ multipart: true, rawBody: true, formidable: { maxFileSize: Infinity } })],
  ["passport initialize", passport.initialize()],
  ["passport session", passport.session()],
  ["protected routes", isProtected]
];

for (const [key, value] of middleware) {
  value._name = key;
  app.use(value);
}

const upload = multer({ dest: 'server/uploads/' });
const dataRoutes = (new router())
  .get('/about/text', about)
  .post('/about/text', about)
  .get(['/artwork', '/'], index)
  .post('/artwork', upload.single('image'), create)
  .get('/artwork/:slug', show)
  .put('/artwork/:slug', upload.single('image'), update)
  .delete('/artwork/:slug', destroy)
  .post('/subscriber/create', createSubscriberUser)
  .get('/env', env)
  .get('/orders/', info)
  .get('/orders/:id', info)
  .post('/stripe/checkout/intent', checkout.stripe)
  .post('/stripe/webhook', webhook.stripe)
  .post('/etransfer/checkout', checkout.etransfer)
  .post('/etransfer/webhook', webhook.etransfer);


const loginRoutes = (new router({prefix: '/auth'}))
  .post('/login', passport.authenticate('local', { successRedirect: 'whoami', failureRedirect: 'failed' }))
  .post('/change-password', changePassword)
  .get('/logout', async ctx => { ctx.logout(); ctx.redirect("/login"); })
  .get('/whoami', async ctx => ctx.body = JSON.stringify(ctx.state.user))
  .get('/failed', async ctx => ctx.body = { error: 'Authentication Failed' })
  .get('/users',  async ctx => ctx.body = { users: await User.find({}).exec() } );

const apiRoutes = (new router())
  .use('/api/v1',
    dataRoutes.routes(),
    dataRoutes.allowedMethods(),
    loginRoutes.routes(),
    loginRoutes.allowedMethods()
);

const uploadRedirect = (new router())
  .get('/uploads/:file', uploads);

app.use(
  uploadRedirect.routes(),
  uploadRedirect.allowedMethods()
);

app.use(
  apiRoutes.routes(),
  apiRoutes.allowedMethods()
);

// Pipe unmatched requests to polymer
app.use(pipe);

app.listen(process.env.PORT, () => {
  const link = new URL(process.env.SITE_URL)
  link.port = process.env.PORT;
  console.log(`App server up. Visit ${link}`)
});
