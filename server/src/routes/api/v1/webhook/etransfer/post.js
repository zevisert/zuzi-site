import { Order } from "../../../../../models/index.js";
import { email, withContext } from "../../../../../email/index.js";

import {
  orderAcceptedMessage,
  orderRejectedMessage,
} from "../../../../../email/renderers/etransfer.js";

export async function post(ctx) {
  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  const { accepted, orderId } = ctx.request.body;

  const order = await Order.findOne({ _id: orderId, status: "pending" })
    .populate({ path: "items.item", select: "title description preview slug" })
    .populate({ path: "items.pricing" });

  if (!order) {
    ctx.throw(400, JSON.stringify({ error: `Order does not exist or is not pending` }));
  }

  if (accepted) {
    order.status = "paid";

    // Email the customer
    await email.deliver(
      orderAcceptedMessage(
        withContext(
          {
            headline: "Order Accepted",
            delivery_reason: [
              "This message was generated in response to an update to the status of an order associated with this email address.",
              "Interac E-transfer based payment for the associated order has been accepted.",
            ].join(" "),
          },
          order
        )
      )
    );

    await order.save();
    ctx.body = { order };
  } else {
    const { reason } = ctx.request.body;
    if (reason) {
      order.status = "rejected";
      order.info = reason;

      // Email the customer
      await email.deliver(
        orderRejectedMessage(
          withContext(
            {
              headline: "Rejected Order",
              delivery_reason: [
                "This message was generated in response to an update to the status of an order associated with this email address.",
                "The associated order has been rejected, an no further processing will occur.",
              ].join(" "),
            },
            order
          )
        )
      );

      await order.save();
      ctx.body = { order };
    } else {
      ctx.throw(400, JSON.stringify({ error: "Rejected order must have a reason" }));
    }
  }
}
