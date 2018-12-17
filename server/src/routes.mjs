import shortid from 'shortid';
import sharp from 'sharp';
import path from 'path';
import del from 'del';

import { Post, Pricing, Size } from './models.mjs';
import { v8n } from './validation.mjs';

export async function notFound(ctx, next) {
  await next();
  if (ctx.body || !ctx.idempotent) return;
  ctx.throw(404, { error: '404: unknown route' });
}

export async function index(ctx) {

  let opts = {};
  if (ctx.isUnauthenticated()) {
    opts = {...opts, active: true};
  }

  const posts = await Post.find(opts).exec();
  
  ctx.body = { posts };
}

export async function create(ctx) {

  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  const body = ctx.request.body;
  const post = new Post();

  const image = ctx.request.files.image;
  if (image) {
    const uploadName = `${shortid.generate()}.jpg`;
    await sharp(image.path)
      .resize({width: 600})
      .jpeg({
        progressive: true,
        quality: 100
      })
      .toFile(path.join(process.cwd(), 'server', 'uploads', uploadName));
    post.preview = uploadName;
  } else {
    ctx.throw(400, { error: 'No file uploaded' });
  }
  
  const pricings = JSON.parse(body.pricings);
  post.pricings = [];

  for (const obj of pricings) {
    const pricing = new Pricing();
    pricing.price = obj.price;
    pricing.medium = obj.medium;
    pricing.size = new Size(obj.size);
    
    pricing.save();
    post.pricings.push(pricing);
  }

  post.slug = body.title.toLowerCase().replace(/ /g, '-');
  post.title = body.title;
  post.description = body.description;
  post.active = body.active;
  
  await post.save();

  ctx.body = { post };
}

export async function show(ctx) {
  const slug = ctx.params.slug;
  const post = await Post.findOne({slug}).exec();
  if (!post) ctx.throw(404, { error: 'invalid post slug' });

  ctx.body = { post };
}

export async function update(ctx) {

  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  const slug = ctx.params.slug;
  const post = await Post.findOne({slug}).exec();

  const body = ctx.request.body;

  const image = ctx.request.files.image;
  if (image) {
    const uploadName = `${shortid.generate()}.jpg`;
    await sharp(image.path)
      .resize({width: 600})
      .jpeg({
        progressive: true,
        quality: 100
      })
      .toFile(path.join(process.cwd(), 'server', 'uploads', uploadName));
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
      pricing.size = new Size(obj.size);
      
      pricing.save();
      post.pricings.push(pricing);
    }
  }

  post.active = body.active || post.active;

  post.slug = post.title.toLowerCase().replace(/ /g, '-');

  await post.save();

  ctx.body = { post };
}

export async function destroy(ctx) {

  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  const slug = ctx.params.slug;
  const post = await Post.findOne({slug}).exec();

  const uploadDir = path.join(process.cwd(), 'server', 'uploads');

  const pathToDel = del.sync(path.join(uploadDir, post.preview), {dryRun: true})[0];
  
  if (pathToDel) {
    const relative = path.relative(uploadDir, pathToDel);
    if (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
      await del(path.join(uploadDir, relative));
    }
  }

  await post.remove();

  ctx.body = { success: true }; 
}
