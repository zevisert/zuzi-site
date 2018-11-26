import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

export const postSchema = new mongoose.Schema({
    id: {type: String, index: true, unique: true },
    title: String,
    description: String,
    price: Number,
    sizes: [{width: Number, height: Number}],
    inventory: Number,
    active: Boolean,
    preview: String
});

export const Post = mongoose.model('Post', postSchema);

export const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    admin: String,
});

userSchema.plugin(passportLocalMongoose);

export const User = mongoose.model('User', userSchema);
