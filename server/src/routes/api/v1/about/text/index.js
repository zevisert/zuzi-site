import { get } from "./get.js";
import { post } from "./post.js";
import router from "koa-router";

export default new router().get("GET", "/", get).post("POST", "/", post);
