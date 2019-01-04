import shortid from 'shortid';
import sharp from 'sharp';
import path from 'path';
import del from 'del';

import { Post, Pricing, Size, Order } from './models';
import { v8n } from './validation';

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
  ctx.throw(404, "404: Not Found", { error: '404: unknown route' });
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
    pricing.available = obj.available;
    pricing.size = new Size(obj.size);
    
    pricing.save();
    post.pricings.push(pricing);
  }

  const tags = JSON.parse(body.tags);
  post.tags = tags;

  post.slug = body.title.toLowerCase().replace(/ /g, '-');
  post.title = body.title;
  post.description = body.description;
  post.active = body.active;
  
  await post.save();

  ctx.body = { post };
}

export async function show(ctx) {

  let opts = { deletedOn: null };
  if (ctx.isUnauthenticated()) {
    opts = {...opts, active: true };
  }

  const slug = ctx.params.slug;
  const post = await Post.findOne({slug, ...opts}).exec();
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
    ctx.throw(404, 'no order found');
  }
}
