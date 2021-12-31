import router from "koa-router";
import { get } from "./get.js";

export default new router().get("GET", "/", get);
