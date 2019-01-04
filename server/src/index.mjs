import koa from 'koa';
import body from 'koa-body';
import serve from 'koa-static';
import mount from 'koa-mount';
import session from 'koa-session';
import router from 'koa-router';
import multer from 'koa-multer';
import passport from 'koa-passport';

import path from 'path';
import h2p from 'http2';
import fs from 'fs';

// Must be first, side effects import process.env
import { db_connect, pipe, isProtected } from './config';

import { User } from './models';
import { index, create, show, update, destroy, notFound, info} from './routes'; 
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
  ["body parser", body({ multipart: true, rawBody: true })],
  ["static /uploads", mount('/uploads', serve(path.join(process.cwd(), 'server', 'uploads')))],
  ["passport initialize", passport.initialize()],
  ["passport session", passport.session()],
  ["protected routes", isProtected]
];

for (const [key, value] of middleware) {
  value._name = key;
  app.use(value);
}

const upload = multer({dest: 'server/uploads/'});
const dataRoutes = (new router())
  .get(['/artwork', '/'], index)
  .post('/artwork', upload.single('image'), create)
  .get('/artwork/:slug', show)
  .put('/artwork/:slug', upload.single('image'), update)
  .delete('/artwork/:slug', destroy)
  .get('/orders/', info)
  .get('/orders/:id', info)
  .post('/stripe/checkout/intent', checkout.stripe)
  .post('/stripe/webhook', webhook.stripe)
  .post('/etransfer/checkout', checkout.etransfer)
  .post('/etransfer/webhook', webhook.etransfer);


const loginRoutes = (new router({prefix: '/auth'}))
  .post('/login', passport.authenticate('local', { successRedirect: 'whoami', failureRedirect: 'failed' }))
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

app.use(
  apiRoutes.routes(),
  apiRoutes.allowedMethods()
);

const staticRoutes = (new router())
  .get('/*', pipe);

app.use(
  staticRoutes.routes(),
  staticRoutes.allowedMethods()
);

const runningCallback = () => console.log(`Server up on port ${process.env.PORT}`); 

if (process.env.NODE_ENV === 'DEVELOPMENT') {
  app.listen(process.env.PORT, runningCallback);
} else {
  h2p.createSecureServer({
      key: fs.readFileSync(process.env.CERT_PRIVKEY_PATH, 'utf8').toString(),
      cert: fs.readFileSync(process.env.CERT_FULLCHAIN_PATH, 'utf8').toString(),
    }, app.callback())
    .listen(process.env.PORT, runningCallback);
}
