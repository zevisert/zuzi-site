import { get } from "./get.js";

import router from "koa-router";

export default new router().get("GET", "/", get);
