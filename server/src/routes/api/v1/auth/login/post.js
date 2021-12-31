import passport from "koa-passport";

export function post(ctx) {
  return passport.authenticate("local", {
    successRedirect: "whoami",
    failureRedirect: "failed",
  })(ctx);
}
