import { Post } from "../../../../../models/index.js";

export async function get(ctx) {
  let opts = { deletedOn: null };
  if (ctx.isUnauthenticated()) {
    opts = { ...opts, active: true };
  }

  const slug = ctx.params.slug;
  const post = await Post.findOne({ slug, ...opts }).exec();
  if (!post) ctx.throw(404, JSON.stringify({ error: "invalid post slug" }));

  ctx.body = { post };
}
