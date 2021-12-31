import fs from "fs";
import { Post, Pricing, Size } from "../../../../models/index.js";
import { toSlug, processImage } from "../../../../lib.js";

export async function post(ctx) {
  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }
  try {
    const metadata = JSON.parse(fs.readFileSync(ctx.request.files.metadata.path));
    const image = ctx.request.files.image;

    const post = new Post();

    if (image) {
      const uploadName = await processImage(image, metadata.should_watermark);
      post.preview = uploadName;
    } else {
      ctx.throw(400, JSON.stringify({ error: "No file uploaded" }));
    }

    post.pricings = [];

    for (const obj of metadata.pricings) {
      const pricing = new Pricing();
      pricing.price = obj.price;
      pricing.medium = obj.medium;
      pricing.available = obj.available;
      pricing.size = new Size(obj.size);

      pricing.save();
      post.pricings.push(pricing);
    }

    post.slug = toSlug(metadata.title);
    post.tags = metadata.tags;
    post.title = metadata.title;
    post.description = metadata.description;
    post.active = metadata.active;
    post.display_position = metadata.display_position;

    await post.save();

    ctx.body = { post };
  } catch (error) {
    console.error(error);
    ctx.throw(400, JSON.stringify({ error }));
  }
}
