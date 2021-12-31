import _id from "./[id]/index.js";

import router from "koa-router";
import { get } from "./get.js";

export default new router()
  .use("/:id", _id.routes(), _id.allowedMethods())
  .get("GET", "/", get);
