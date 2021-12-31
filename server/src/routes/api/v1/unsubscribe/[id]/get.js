import { User } from "../../../../../models/index.js";

export async function get(ctx) {
  const id = ctx.params.id;
  let message;
  try {
    const user = await User.findById(id);
    const email = user.email;
    await user.delete();
    message = new URLSearchParams({
      message: `Successfully unsubscribed ${email}`,
    });
  } catch (error) {
    message = new URLSearchParams({
      message: `Could not perform un-subscription`,
    });
  } finally {
    ctx.redirect(`/gallery?${message}`);
  }
}
