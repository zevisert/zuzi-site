import v1 from "./v1/index.js";

import router from "koa-router";

export default new router().use("/v1", v1.routes(), v1.allowedMethods());
