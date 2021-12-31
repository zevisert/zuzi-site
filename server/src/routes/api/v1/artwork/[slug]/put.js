import { Post, Pricing, Size } from "../../../../../models/index.js";
import { toSlug, processImage } from "../../../../../lib.js";
import fs from "fs";

export async function put(ctx) {
  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  try {
    const slug = ctx.params.slug;
    const post = await Post.findOne({ slug });

    const metadata = JSON.parse(fs.readFileSync(ctx.request.files.metadata.path));
    const image = ctx.request.files.image;
    if (image) {
      const uploadName = await processImage(image, metadata.should_watermark);
      post.preview = uploadName;
    }

    post.title = metadata.title || post.title;
    post.description = metadata.description || post.description;
    post.active = metadata.active !== undefined ? metadata.active : post.active;
    post.display_position =
      metadata.display_position !== undefined
        ? metadata.display_position
        : post.display_position;
    post.slug = toSlug(post.title);

    if (metadata.tags) {
      post.tags = metadata.tags;
    }

    if (metadata.pricings) {
      post.pricings = [];

      for (const obj of metadata.pricings) {
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
    console.error(error);
    ctx.throw(400, JSON.stringify({ error }));
  }
}
