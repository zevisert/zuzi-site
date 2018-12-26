import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

mongoose.set('useCreateIndex', true);

export const sizeSchema = new mongoose.Schema({
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm', enum: ['cm', 'in', 'm', 'ft']}
});
export const Size = mongoose.model('Size', sizeSchema);


export const pricingSchema = new mongoose.Schema({
    price: Number,
    size: sizeSchema,
    medium: String
});
export const Pricing = mongoose.model('Pricing', pricingSchema);


export const postSchema = new mongoose.Schema({
    slug: { type: String, unique: true },
    title: String,
    description: String,
    active: Boolean,
    preview: String,
    pricings: [pricingSchema],
    deletedOn: { type: Date, default: null, select: false }
});
export const Post = mongoose.model('Post', postSchema);


export const customerSchema = new mongoose.Schema({
    name: String,
    email: String,
    shipping: {
        address_lines: [String],
        postal_code: String,
        locality: String,
        region: String,
        country: String
    }
});
export const Customer = mongoose.model('Customer', customerSchema);

export const orderItemSchema = new mongoose.Schema({
    quantity: Number,
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    pricing: { type: mongoose.Schema.Types.ObjectId, ref: 'Pricing' }
});

export const OrderItem = mongoose.model('OrderItem', orderItemSchema);

export const orderSchema = new mongoose.Schema({
    items: [orderItemSchema],
    customer: customerSchema,
    type: { type: String, enum: ['stripe', 'etransfer']},
    intent_id: String,
    status: {type: String, enum: ['pending', 'paid', 'rejected']},
    date: Date,
    info: String,
    totalCents: Number
});
export const Order = mongoose.model('Order', orderSchema);


export const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    admin: Boolean
});
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
export const User = mongoose.model('User', userSchema);
