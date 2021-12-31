import { User } from "../../../../../models/index.js";
export async function post(ctx) {
  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  const body = ctx.request.body;
  const user = await User.findByUsername(body.email);

  user.changePassword(body.oldPassword, body.newPassword);

  ctx.logout();
  ctx.redirect("/login?message=Successfully changed password");
}
