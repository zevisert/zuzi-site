import router from "koa-router";
import changePassword from "./change-password/index.js";
import failed from "./failed/index.js";
import login from "./login/index.js";
import logout from "./logout/index.js";
import users from "./users/index.js";
import whoami from "./whoami/index.js";

export default new router()
  .use("/change-password", changePassword.routes(), changePassword.allowedMethods())
  .use("/failed", failed.routes(), failed.allowedMethods())
  .use("/login", login.routes(), login.allowedMethods())
  .use("/logout", logout.routes(), logout.allowedMethods())
  .use("/users", users.routes(), users.allowedMethods())
  .use("/whoami", whoami.routes(), whoami.allowedMethods());
