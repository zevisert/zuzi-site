/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 */

import mongoose from "mongoose";
mongoose.set("useCreateIndex", true);

export { AboutPage } from "./about-page.model.js";
export { Customer } from "./customer.model.js";
export { OrderItem } from "./order-item.model.js";
export { Order } from "./order.model.js";
export { Post } from "./post.model.js";
export { Pricing } from "./pricing.model.js";
export { Size } from "./size.model.js";
export { Subscription } from "./subscription.model.js";
export { User } from "./user.model.js";
export { Mailing } from "./mailing.model.js";
