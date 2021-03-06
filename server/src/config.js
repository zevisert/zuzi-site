/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import mongoose from 'mongoose';
import request from 'request';

import dotenv from 'dotenv';
import { User } from './models/user.model.js';
dotenv.config({path: 'server/process.env'});

const required_env = new Set([
    'NODE_ENV',
    'PATH',
    'PORT',
    'SECRET_KEY',
    'MONGO_URL',
    'MONGO_USER',
    'MONGO_PW',
    'STRIPE_PK',
    'STRIPE_SK',
    'STRIPE_WHSEC',
    'SENTRY_DSN',
    'SENTRY_ENABLE',
    'EMAIL_SYS_ADDR',
    'EMAIL_SYS_HOST',
    'EMAIL_SYS_PORT',
    'EMAIL_SYS_USE_TLS',
    'EMAIL_SYS_PW',
    'SITE_ADMIN_EMAIL',
    'SITE_ADMIN_DEFAULTPW',
    'ORDERS_EMAIL',
    'SUBSCRIBERS_EMAIL',
    'SUPPORT_EMAIL',
    'ETRANSFER_EMAIL',
    'ETRANSFER_PW',
    'CDN_SPACENAME',
    'CDN_REGION',
    'CDN_HOST',
    'CDN_DIR',
    'CDN_ACCESSKEY',
    'CDN_SECRET_ACCESSKEY',
    'PUSH_PUBKEY',
    'PUSH_SECRET',
    'SITE_URL',
    'API_URL',
])

const missing_env = [...required_env.values()].filter(env_var => process.env[env_var] === undefined)

if (missing_env.length > 0) {
    console.log(`The following environment variables are undefined:`);
    console.log(missing_env.map(key => `- ${key}`).join('\n'));
    console.log(`Supply them and try again`);
    process.exit()
}

const extra_env = new Set([...Object.keys(process.env)].filter(x => !required_env.has(x)));
if (extra_env.size > 0) {
    console.log(`Unknown environment variables found:`)
    console.log([...extra_env.values()].map(key => `- ${key}`).join('\n'));
    console.log('Remove access to the above or update the known list of required env variables');
}


export const db_connect = (server) => {

    const connect = async () => {
        await mongoose.connect(process.env.MONGO_URL, {
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PW,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        if ((await User.countDocuments({admin: true})) < 1) {
            const user = new User({ email: process.env.SITE_ADMIN_EMAIL, admin: true });
            await user.setPassword(process.env.SITE_ADMIN_DEFAULTPW);
            await user.save();
        }
    }

    server.context.db = mongoose.connection;
    server.context.db.on('error', console.error.bind(console, 'connection error:'));
    server.context.db.on('disconnected', function() {
        console.error('connection lost: reconnecting in 1 minute');
        setTimeout(connect, 6000);
    });

    connect();
}


export const isProtected = async (ctx, next) => {
    if (ctx.path.match(/^\/admin/) && ctx.isUnauthenticated()) {
        ctx.redirect(`/login?referrer=${ctx.path}`, 401);
    } else {
        await next();
    }
}

let page_pipe;
if (process.env.NODE_ENV === 'DEVELOPMENT') {
    page_pipe = async ctx => {
        const uri = `http://localhost:8081${ctx.request.originalUrl}`;
        ctx.body = ctx.req
          .pipe(request(uri))
          .on('error', (err) => { console.log(err); throw err; });
    };
} else {
    page_pipe = async ctx => {
        console.error('Should not be receiving requests in non-development.');
        console.warn(ctx.request.originalUrl);
    };
}

export const pipe = page_pipe;
