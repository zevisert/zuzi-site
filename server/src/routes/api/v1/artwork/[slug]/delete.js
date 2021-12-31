import path from "path";
import { Post } from "../../../../../models/index.js";
import _del from "del";

export async function del(ctx) {
  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  const slug = ctx.params.slug;
  const post = await Post.findOne({ slug }).select("+deletedOn").exec();

  const uploadDir = path.join(process.cwd(), "server", "uploads");

  const [pathToDel, ...rest] = del.sync(path.join(uploadDir, post.preview), {
    dryRun: true,
  });

  if (pathToDel && rest.length === 0) {
    const relative = path.relative(uploadDir, pathToDel);
    if (!!relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
      await _del(path.join(uploadDir, relative));
    }
  }

  post.preview = null;
  post.active = false;
  post.slug = `del_${post._id}`;
  post.deletedOn = Date.now();
  post.markModified("deletedOn");
  await post.save();

  ctx.body = { success: true };
}
