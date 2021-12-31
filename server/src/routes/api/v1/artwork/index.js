import _slug from "./[slug]/index.js";

import router from "koa-router";
import { get } from "./get.js";
import { post } from "./post.js";
import multer from "@koa/multer";

const upload = multer({ dest: "uploads/" });

export default new router()
  .use("/:slug", _slug.routes(), _slug.allowedMethods())
  .get("GET", "/", get)
  .post("POST", "/", upload.single("image"), post);
