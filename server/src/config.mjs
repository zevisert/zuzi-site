import mongoose from 'mongoose';
import request from 'request';
import prpl from 'prpl-server';

/* 
====================================== API ROUTES ======================================
|   NAME   |     PATH          |   HTTP VERB     |            PURPOSE                   |
|----------|-------------------|-----------------|--------------------------------------| 
| Index    | /artwork          |      GET        | Lists all artwork                    |
| Create   | /artwork          |      POST       | Creates a new artwork posting        |
| Show     | /artwork/:id      |      GET        | Shows one specified artwork post     |
| Update   | /artwork/:id      |      PUT        | Updates a particular artwork post    |
| Destroy  | /artwork/:id      |      DELETE     | Deletes a particular artwork post    |

==================================== FRONTEND ROUTES ====================================
|   NAME   |     PATH          |   HTTP VERB     |            PURPOSE                   |
|----------|-------------------|-----------------|--------------------------------------| 
| New      | /artwork/new      |      GET        | Preps form for new artwork entry     |
| Edit     | /artwork/:id/edit |      GET        | Preps info for an artwork edit       |
*/


export const db_connect = (server) => {
    
    const connect = async () => { 
        await mongoose.connect(process.env.MONGO_URL, {
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PW,
            useNewUrlParser: true
        });
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
        ctx.redirect('/login', 401);
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
    page_pipe = prpl.makeHandler('server/build/', {
        forwardErrors: true,
        builds: [
            {name: 'esm-bundled', browserCapabilities: ['es2015', 'modules']},
            {name: 'es6-bundled', browserCapabilities: ['es2015']},
            {name: 'es5-bundled'},
        ]
    });
}

export const pipe = page_pipe;
