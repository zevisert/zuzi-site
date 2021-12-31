import router from "koa-router";

import intent from "./intent/index.js";

export default new router().use("/intent", intent.routes(), intent.allowedMethods());
