import router from "koa-router";
import text from "./text/index.js";

export default new router().use("/text", text.routes(), text.allowedMethods());
