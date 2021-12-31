import router from "koa-router";

import about from "./about/index.js";
import artwork from "./artwork/index.js";
import auth from "./auth/index.js";
import checkout from "./checkout/index.js";
import env from "./env/index.js";
import orders from "./orders/index.js";
import subscriber from "./subscriber/index.js";
import unsubscribe from "./unsubscribe/index.js";
import webhook from "./webhook/index.js";

export default new router()
  .use("/about", about.routes(), about.allowedMethods())
  .use("/artwork", artwork.routes(), artwork.allowedMethods())
  .use("/auth", auth.routes(), auth.allowedMethods())
  .use("/checkout", checkout.routes(), checkout.allowedMethods())
  .use("/env", env.routes(), env.allowedMethods())
  .use("/orders", orders.routes(), orders.allowedMethods())
  .use("/subscriber", subscriber.routes(), subscriber.allowedMethods())
  .use("/unsubscribe", unsubscribe.routes(), unsubscribe.allowedMethods())
  .use("/webhook", webhook.routes(), webhook.allowedMethods());
