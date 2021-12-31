import { Post } from "../../../../models/index.js";

export async function get(ctx) {
  let opts = { deletedOn: null };
  if (ctx.isUnauthenticated()) {
    opts = { ...opts, active: true };
  }

  const posts = await Post.find(opts).exec();

  ctx.body = { posts };
}
