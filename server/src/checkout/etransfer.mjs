import { email } from '../email';
import { Order, OrderItem, Customer, User } from '../models';
import {
  orderGeneratedTemplate,
  orderPendingTemplate,
  orderAcceptedTemplate,
  orderRejectedTemplate
} from '../email/templates/etransfer.mjs';

export async function checkout(ctx) {

  const { amount, metadata, ...rest } = ctx.request.body;

  const items = metadata.items.map(item => new OrderItem({
    quantity: item.quantity,
    item: item.postId,
    pricing: item.pricingId
  })); 

  const order = new Order({
    items,
    type: 'etransfer',
    status: 'pending',
    customer: new Customer(metadata.customer),
    date: Date.now(),
    totalCents: amount,
    info: metadata.info
  });

  await order.save();

  const inflatedOrder = await Order.findById(order._id)
    .populate({path: 'items.item', select: "title description"})
    .populate({path: 'items.pricing'});

  // Email the customer
  await email.deliver(orderPendingTemplate(inflatedOrder));

  // Email the admins
  await email.deliver(orderGeneratedTemplate(inflatedOrder, await User.find({ admin: true })));

  ctx.body = { success: true };
}

export async function webhook(ctx) {
  if (ctx.isUnauthenticated()) {
    ctx.redirect("/login");
    return;
  }

  const { accepted, orderId } = ctx.request.body;

  console.log({ accepted, orderId });

  const order = await Order.findById(orderId)
    .populate({path: 'items.item', select: "title description preview"})
    .populate({path: 'items.pricing'});

  if (accepted) {

    order.status = 'paid';
    
    // Email the customer
    await email.deliver(orderAcceptedTemplate(order));
    
    await order.save();
    ctx.body = { order };

  } else {

    const { reason } = ctx.request.body;
    if (reason) {
      order.status = 'rejected';
      await order.save();

      // Email the customer
      await email.deliver(orderRejectedTemplate(order, ctx.request.body.reason)); 

      ctx.body = { orders: [ order ] };
    } else {
      ctx.throw(400, 'Rejected order must have a reason');
    }
  }
} 