import _file from "./[file]/index.js";

import router from "koa-router";

export default new router().use("/:file", _file.routes(), _file.allowedMethods());
