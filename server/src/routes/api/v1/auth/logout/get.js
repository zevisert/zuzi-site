export function get(ctx) {
  ctx.logout();
  ctx.redirect("/login");
}
