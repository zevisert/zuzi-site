import router from "koa-router";

import { post } from "./post.js";

export default new router().post("POST", "/", post);
