import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

export const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },

    email: {
        type: String,
        unique: true,
        required: [true, 'User email is required']
    },

    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

export const User = mongoose.model('User', userSchema);
