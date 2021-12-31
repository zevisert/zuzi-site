import etransfer from "./etransfer/index.js";
import stripe from "./stripe/index.js";

import router from "koa-router";

export default new router()
  .use("/stripe", stripe.routes(), stripe.allowedMethods())
  .use("/etransfer", etransfer.routes(), etransfer.allowedMethods());
