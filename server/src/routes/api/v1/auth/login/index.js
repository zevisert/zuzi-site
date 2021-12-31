import { post } from "./post.js";
import router from "koa-router";

export default new router().post("POST", "/", post);
