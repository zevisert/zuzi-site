import { User, Subscription } from "../../../../../models/index.js";

export async function post(ctx) {
  const body = ctx.request.body;
  try {
    if (body.email) {
      const user = await User.create({
        admin: false,
        subscriber: true,
        email: body.email,
      });
      await user.save();
    } else if (body.subscription) {
      const subscription = await Subscription.create(body.subscription);
      await subscription.save();
    }

    ctx.body = { success: true, isNew: true };
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000 /* DuplicateKey */) {
      ctx.body = { success: true, isNew: false, meta: "Already subscribed" };
    } else {
      ctx.throw(400, JSON.stringify({ error }));
    }
  }
}
