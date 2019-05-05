/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import shortid from 'shortid';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import del from 'del';
import Spaces from 'aws-sdk';

import { Post, Pricing, Size, Order, AboutPage, User } from './models';

const toSlug = title => title
  .toLowerCase()
  .replace(/[^a-z-AZ0-9-]+/g, ' ')
  .replace(/-/g, ' ')
  .trim()
  .replace(/\s+/g, '-');

async function processImage(image) {
  const uploadName = `${shortid.generate()}.jpg`;
  const localName = path.join(process.cwd(), 'server', 'uploads', uploadName);
  const cdnName = path.join(process.env.CDN_DIR, uploadName);

  // Resize Img
  await sharp(image.path)
    .resize({width: 1000})
    .jpeg({
      progressive: true,
      quality: 100
    })
    .toFile(localName);

  // Upload to DO spaces
  const endpoint = new Spaces.Endpoint(`${process.env.CDN_REGION}.${process.env.CDN_HOST}`);
  const space = new Spaces.S3({
    endpoint,
    accessKeyId: process.env.CDN_ACCESSKEY,
    secretAccessKey: process.env.CDN_SECRET_ACCESSKEY
  });

  await space.upload({
    Bucket: process.env.CDN_SPACENAME,
    Key: cdnName,
    Body: fs.createReadStream(localName),
    ACL: 'public-read'
  }).promise();

  return uploadName;
}

/*
========================================= API ROUTES ==============================================
|   NAME       |     PATH            |   HTTP VERB     |            PURPOSE                       |
|--------------|---------------------|-----------------|------------------------------------------|
| Index        | /artwork            | GET             | Lists all artwork                        |
| Create       | /artwork            | POST            | Creates a new artwork posting            |
| Show         | /artwork/:slug      | GET             | Shows one specified artwork post         |
| Update       | /artwork/:slug      | PUT             | Updates a particular artwork post        |
| Destroy      | /artwork/:slug      | DELETE          | Deletes a particular artwork post        |
| Info         | /orders/:id         | GET             | Fetches one specified order              |
*/

export async function notFound(ctx, next) {
  await next();
  if (ctx.body || !ctx.idempotent) return;
  ctx.throw(404, JSON.stringify({ error: '404: unknown route' }));
}

export async function index(ctx) {

  let opts = { deletedOn: null };
  if (ctx.isUnauthenticated()) {
    opts = {...opts, active: true };
  }

  const posts = await Post.find(opts).exec();

  ctx.body = { posts };
}

export async function create(ctx) {

  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }
  try {

    const body = ctx.request.body;
    const post = new Post();

    const image = ctx.request.files.image;
    if (image) {
      const uploadName = await processImage(image);
      post.preview = uploadName;
    } else {
      ctx.throw(400, JSON.stringify({ error: 'No file uploaded' }));
    }

    const pricings = JSON.parse(body.pricings);
    post.pricings = [];

    for (const obj of pricings) {
      const pricing = new Pricing();
      pricing.price = obj.price;
      pricing.medium = obj.medium;
      pricing.available = obj.available;
      pricing.size = new Size(obj.size);

      pricing.save();
      post.pricings.push(pricing);
    }

    const tags = JSON.parse(body.tags);
    post.tags = tags;

    post.slug = toSlug(body.title)
    post.title = body.title;
    post.description = body.description;
    post.active = body.active;

    await post.save();

    ctx.body = { post };
  } catch (error) {
    ctx.throw(400, JSON.stringify({ error }));
  }
}

export async function show(ctx) {

  let opts = { deletedOn: null };
  if (ctx.isUnauthenticated()) {
    opts = {...opts, active: true };
  }

  const slug = ctx.params.slug;
  const post = await Post.findOne({slug, ...opts}).exec();
  if (!post) ctx.throw(404, JSON.stringify({ error: 'invalid post slug' }));

  ctx.body = { post };
}

export async function update(ctx) {

  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  try {

    const slug = ctx.params.slug;
    const post = await Post.findOne({slug}).exec();

    const body = ctx.request.body;

    const image = ctx.request.files.image;
    if (image) {
      const uploadName = await processImage(image);
      post.preview = uploadName;
    }

    post.title = body.title || post.title;
    post.description = body.description || post.description;

    if (body.pricings) {
      const pricings = JSON.parse(body.pricings);
      post.pricings = [];

      for (const obj of pricings) {
        const pricing = new Pricing();
        pricing.price = obj.price;
        pricing.medium = obj.medium;
        pricing.available = obj.available;
        pricing.size = new Size(obj.size);

        await pricing.save();
        post.pricings.push(pricing);
      }
    }

    if (body.tags) {
      const tags = JSON.parse(body.tags);
      post.tags = tags;
    }

    post.active = body.active || post.active;

    post.slug = toSlug(post.title);

    await post.save();

    ctx.body = { post };
  } catch (error) {
    ctx.throw(400, JSON.stringify({ error }));
  }
}

export async function destroy(ctx) {

  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  const slug = ctx.params.slug;
  const post = await Post.findOne({slug}).select('+deletedOn').exec();

  const uploadDir = path.join(process.cwd(), 'server', 'uploads');

  const [pathToDel, ...rest] = del.sync(path.join(uploadDir, post.preview), {dryRun: true});

  if (pathToDel && rest.length === 0) {
    const relative = path.relative(uploadDir, pathToDel);
    if (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
      await del(path.join(uploadDir, relative));
    }
  }

  post.preview = null;
  post.active = false;
  post.slug = `del_${post._id}`;
  post.deletedOn = Date.now();
  post.markModified('deletedOn');
  await post.save();

  ctx.body = { success: true };
}


export async function info(ctx) {
  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  try {
    if (ctx.params.id === undefined) {
      const orders = await Order.find()
        .sort({date: -1})
        .limit(10)
        .populate({path: 'items.item', select: "-pricings"})
        .populate({path: 'items.pricing'});

      ctx.body = { orders };

    } else {
      const order = await Order.findById(ctx.params.id)
          .populate({path: 'items.item', select: "-pricings"})
          .populate({path: 'items.pricing'});
      if (! order ) {
        throw new Error('no order for id');
      }

      ctx.body = { orders: [ order ] };
    }

  } catch (err) {
    ctx.throw(404, JSON.stringify({ error: 'no order found' }));
  }
}


export async function env(ctx) {
  ctx.body = {
    env: {
      STRIPE_PK: process.env.STRIPE_PK,
      SENTRY_DSN: process.env.SENTRY_DSN,
      SENTRY_ENABLE: process.env.SENTRY_ENABLE === 'TRUE',
      PUSH_PUBKEY: process.env.PUSH_PUBKEY
    }
  }
}


export async function about(ctx) {

  let aboutPage = await AboutPage.findOne();
  if (!aboutPage) {
    aboutPage = new AboutPage();
  }

  if (ctx.method === "POST") {
    const body = ctx.request.body;
    const lines = body.lines;
    aboutPage.lines = lines;
    await aboutPage.save();
  }

  ctx.body = { lines: aboutPage.lines };
}

export async function uploads(ctx) {

  const file = ctx.params.file;
  const cdn_url = `${process.env.CDN_SPACENAME}.${process.env.CDN_REGION}.cdn.${process.env.CDN_HOST}`;
  const requested_file = `${process.env.CDN_DIR}/${file}`;

  ctx.redirect(`https://${cdn_url}/${requested_file}`);

}

export async function changePassword(ctx) {

  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  const body = ctx.request.body;
  const user = await User.findByUsername(body.email)

  user.changePassword(body.oldPassword, body.newPassword);

  ctx.logout();
  ctx.redirect("/login?message=Successfully changed password");

}

export async function createSubscriberUser(ctx) {

  const body = ctx.request.body;
  try {
    const user = await User.create({ admin: false, subscriber: true, email: body.email })

    await user.save();

    ctx.body = { success: true }
  } catch (error) {
    ctx.throw(400, JSON.stringify({ error }));
  }

}
