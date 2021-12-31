import { Order } from "../../../../../models/index.js";

export async function get(ctx) {
  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  try {
    const order = await Order.findById(ctx.params.id)
      .populate({ path: "items.item", select: "-pricings" })
      .populate({ path: "items.pricing" });
    if (!order) {
      throw new Error("no order for id");
    }

    ctx.body = { orders: [order] };
  } catch (err) {
    ctx.throw(404, JSON.stringify({ error: "no order found" }));
  }
}
