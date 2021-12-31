export function get(ctx) {
  ctx.body = JSON.stringify(ctx.state.user);
}
