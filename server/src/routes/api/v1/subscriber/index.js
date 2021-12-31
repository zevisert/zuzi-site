import router from "koa-router";

import create from "./create/index.js";

export default new router().use("/create", create.routes(), create.allowedMethods());
