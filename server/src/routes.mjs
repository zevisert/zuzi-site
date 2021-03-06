/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import shortid from 'shortid';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import os from 'os';
import del from 'del';
import Spaces from 'aws-sdk';

import {
  AboutPage,
  Post,
  Pricing,
  Order,
  Size,
  Subscription,
  User,
} from './models';

const toSlug = title => title
  .toLowerCase()
  .replace(/[^a-z-AZ0-9-]+/g, ' ')
  .replace(/-/g, ' ')
  .trim()
  .replace(/\s+/g, '-');

async function processImage(image, shouldWatermark=false) {
  const id = shortid.generate()
  const uploadName = `${id}.jpg`;

  const watermarkName = path.join(process.cwd(), 'images', 'watermark.png')
  const tmpLocalName = path.join(os.tmpdir(), `${id}.png`);
  const localName = path.join(process.cwd(), 'server', 'uploads', uploadName);
  const cdnName = path.join(process.env.CDN_DIR, uploadName);

  // Resize and downscale image
  await sharp(image.path)
    .resize({width: 1000})
    .jpeg({
      progressive: true,
      quality: 100
    })
    .toFile(tmpLocalName)

  if (shouldWatermark) {
    const raster = sharp(tmpLocalName)
    const image = await raster.metadata()

    // Compose the watermark
    await raster
      .composite([{
        input: watermarkName,
        left: 0,
        top: Math.floor(image.height * 0.9),
        blend: 'atop'
      }])
      .toFile(localName);

    // Remove the tmpWatermark
    fs.unlinkSync(tmpLocalName)
  } else {
    try {
      fs.renameSync(tmpLocalName, localName);
    } catch (err) {
      fs.copyFileSync(tmpLocalName, localName);
      fs.unlinkSync(tmpLocalName);
    }
  }

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

    // Multipart-forms are not yet JSON parsed
    body.active = typeof body.active === 'boolean' ? body.active : body.active === 'true'
    body.display_position = typeof body.display_position === 'number' ? body.display_position : +body.display_position
    body.should_watermark = typeof body.should_watermark === 'boolean' ? body.should_watermark : body.should_watermark === 'true'

    const image = ctx.request.files.image;
    if (image) {
      const uploadName = await processImage(image, body.should_watermark);
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
    post.display_position = body.display_position;

    await post.save();

    ctx.body = { post };
  } catch (error) {
    console.error(error)
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
    const post = await Post.findOne({slug});

    const body = ctx.request.body;

    // Multipart-forms are not yet JSON parsed
    if (body.active) {
      body.active = typeof body.active === 'boolean' ? body.active : body.active === 'true'
    }

    if (body.display_position) {
      body.display_position = typeof body.display_position === 'number' ? body.display_position : +body.display_position
    }

    if (body.should_watermark) {
      body.should_watermark = typeof body.should_watermark === 'boolean' ? body.should_watermark : body.should_watermark === 'true'
    }

    const image = ctx.request.files.image;
    if (image) {
      const uploadName = await processImage(image, body.should_watermark);
      post.preview = uploadName;
    }

    post.title = body.title || post.title;
    post.description = body.description || post.description;
    post.active = body.active !== undefined ? body.active : post.active;
    post.display_position = body.display_position !== undefined ? body.display_position : post.display_position;
    post.slug = toSlug(post.title);

    if (body.tags) {
      const tags = JSON.parse(body.tags);
      post.tags = tags;
    }

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

    await post.save();

    ctx.body = { post };
  } catch (error) {
    console.error(error)
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
      SENTRY_ENABLE: process.env.SENTRY_ENABLE === 'true',
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
    if (body.email) {
      const user = await User.create({ admin: false, subscriber: true, email: body.email });
      await user.save();
    } else if (body.subscription) {
      const subscription = await Subscription.create(body.subscription);
      await subscription.save();
    }

    ctx.body = { success: true, isNew: true }
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000 /* DuplicateKey */) {
      ctx.body = { success: true, isNew: false, meta: "Already subscribed" }
    } else {
      ctx.throw(400, JSON.stringify({ error }));
    }
  }
}

export async function removeSubscriberUser(ctx) {

  const id = ctx.params.id;
  let message;
  try {
    const user = await User.findById(id)
    const email = user.email
    await user.delete();
    message = new URLSearchParams({ message: `Successfully unsubscribed ${email}`})
  } catch (error) {
    message = new URLSearchParams({ message: `Could not perform un-subscription` })
  } finally {
    ctx.redirect(`/gallery?${message}`)
  }
}
