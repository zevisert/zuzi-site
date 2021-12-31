import api from "./api/index.js";
import uploads from "./uploads/index.js";

import router from "koa-router";

export default new router()
  .use("/api", api.routes(), api.allowedMethods())
  .use("/uploads", uploads.routes(), uploads.allowedMethods());

export async function notFound(ctx, next) {
  await next();
  if (ctx.body || !ctx.idempotent) return;
  ctx.throw(404, JSON.stringify({ error: "404: unknown route" }));
}
