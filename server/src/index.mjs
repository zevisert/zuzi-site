import koa from 'koa';
import body from 'koa-body';
import serve from 'koa-static';
import mount from 'koa-mount';
import session from 'koa-session';
import router from 'koa-router';
import multer from 'koa-multer';
import passport from 'koa-passport';
import LocalStrategy from 'passport-local';

import path from 'path';
import dotenv from 'dotenv';
dotenv.config({path: 'server/process.env'});

import { User } from './models';
import { index, create, show, update, destroy, notFound} from './routes'; 
import { db_connect, pipe, isProtected } from './config';


const app = new koa();

db_connect(app);

app.keys = [process.env.SECRET_KEY];

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

const middleware = [
  ["404", notFound],
  ["session", session({maxAge: 'session'}, app)],
  ["body parser", body({ multipart: true })],
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
    .get('/artwork/:id', show)
    .put('/artwork/:id', upload.single('image'), update)
    .delete('/artwork/:id', destroy);


const loginRoutes = (new router({prefix: '/auth'}))
    .post('/login', passport.authenticate('local', { successRedirect: 'whoami', failureRedirect: 'failed' }))
    .get('/logout', async ctx => { ctx.logout(); ctx.redirect("/login"); })
    .get('/whoami', async ctx => ctx.body = JSON.stringify(ctx.state.user))
    .get('/failed', async ctx => ctx.body = { error: 'failed login' })
    .get('/users', async ctx =>  ctx.body = { users: await User.find({}).exec() } );
    
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

app.use(pipe);

app.listen(process.env.PORT, () => console.log(`Server up on port ${process.env.PORT}`));
