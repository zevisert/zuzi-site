import { User } from "../../../../../models/index.js";
export async function get(ctx) {
  ctx.body = { users: await User.find({}).exec() };
}
