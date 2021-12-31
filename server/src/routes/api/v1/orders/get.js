import { Order } from "../../../../models/index.js";
export async function get(ctx) {
  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  try {
    const orders = await Order.find()
      .sort({ date: -1 })
      .limit(10)
      .populate({ path: "items.item", select: "-pricings" })
      .populate({ path: "items.pricing" });

    ctx.body = { orders };
  } catch (err) {
    ctx.throw(404, JSON.stringify({ error: "no order found" }));
  }
}
