import mongoose from 'mongoose';
mongoose.set('useCreateIndex', true);

export { AboutPage } from './about-page.model'
export { Customer } from './customer.model'
export { OrderItem } from './order-item.model'
export { Order } from './order.model'
export { Post } from './post.model'
export { Pricing } from './pricing.model'
export { Size } from './size.model'
export { User } from './user.model';
