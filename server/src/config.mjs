/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import mongoose from 'mongoose';
import request from 'request';

import dotenv from 'dotenv';
import { User } from './models';
dotenv.config({path: 'server/process.env'});

export const db_connect = (server) => {
    
    const connect = async () => { 
        await mongoose.connect(process.env.MONGO_URL, {
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PW,
            useNewUrlParser: true
        });

        if ((await User.countDocuments({admin: true})) < 1) {
            const user = new User({ email: process.env.SITE_ADMIN_EMAIL, admin: true});
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

let page_pipe;

export const isProtected = async (ctx, next) => {
    if (ctx.path.match(/^\/admin/) && ctx.isUnauthenticated()) {
        ctx.redirect(`/login?referrer=${ctx.path}`, 401);
    } else {
        await next();
    }
} 

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
