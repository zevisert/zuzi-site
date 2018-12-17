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
    pricings: [pricingSchema]
});

export const Post = mongoose.model('Post', postSchema);

export const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    admin: String,
});

userSchema.plugin(passportLocalMongoose);

export const User = mongoose.model('User', userSchema);
