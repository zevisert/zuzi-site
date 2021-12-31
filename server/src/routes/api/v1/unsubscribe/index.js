import _id from "./[id]/index.js";

import router from "koa-router";

export default new router().use("/:id", _id.routes(), _id.allowedMethods());
