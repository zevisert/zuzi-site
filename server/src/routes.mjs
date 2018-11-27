import shortid from 'shortid';
import sharp from 'sharp';
import path from 'path';
import del from 'del';

import { Post } from './models.mjs';
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
  const id = shortid.generate();
  const post = new Post({ id });

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
  
  if (v8n.title(body)) ctx.throw(400, { error: `Bad title provided: ${typeof body.title}` });
  if (v8n.descr(body)) ctx.throw(400, { error: `Bad description: ${typeof body.description}` });
  if (v8n.price(body)) ctx.throw(400, { error: `Bad price: ${typeof body.price}` });
  if (v8n.inven(body)) ctx.throw(400, { error: `Bad inventory count: ${typeof body.inventory}` });
  if (v8n.sizes(body)) ctx.throw(400, { error: `Bad sizes list: ${typeof body.sizes}` });

  post.title = body.title;
  post.description = body.description;
  post.price = body.price;
  post.inventory = body.inventory;
  post.active = body.active;
  post.sizes = JSON.parse(body.sizes);

  await post.save();

  ctx.body = { post };
}

export async function show(ctx) {
  const id = ctx.params.id;
  const post = await Post.findOne({id}).exec();
  if (!post) ctx.throw(404, { error: 'invalid post id' });

  ctx.body = { post };
}

export async function update(ctx) {

  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  const id = ctx.params.id;
  const post = await Post.findOne({id}).exec();

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
  post.price = body.price || post.price;
  post.inventory = body.inventory || post.inventory;
  post.sizes = JSON.parse(body.sizes) || post.sizes;
  post.active = body.active || post.active;

  await post.save();

  ctx.body = { post };
}

export async function destroy(ctx) {

  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  const id = ctx.params.id;
  const post = await Post.findOne({id}).exec();

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
