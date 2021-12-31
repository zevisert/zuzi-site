import { get } from "./get.js";
import { put } from "./put.js";
import { del } from "./delete.js";
import router from "koa-router";
import multer from "@koa/multer";

const upload = multer({ dest: "uploads/" });
export default new router()
  .get("GET", "/", get)
  .put("PUT", "/", upload.single("image"), put)
  .delete("DELETE", "/", del);
