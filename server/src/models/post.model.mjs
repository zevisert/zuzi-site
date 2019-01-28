import mongoose from 'mongoose';
import { pricingSchema } from './pricing.model';


export const postSchema = new mongoose.Schema({
    slug: {
        type: String,
        unique: true,
        validate: {
            validator: function (value) {
                return /^([a-zA-Z0-9-]+[a-zA-Z0-9])|(del_[a-zA-Z0-9]+)$/.test(value);
            }, 
            message: params => `${params.value} is not a valid identifier (slug)`
        }
    },

    title: {
        type: String,
        required: [true, 'A posting requires a title']
    },

    tags: {
        type: [String],
        required: false,
    },

    description: {
        type: String,
        required: false
    },

    active: {
        type: Boolean,
        default: false
    },

    preview: {
        type: String,
    },

    pricings: {
        type: [pricingSchema],
    },

    deletedOn: {
        type: Date,
        default: null,
        select: false
    }
});

export const Post = mongoose.model('Post', postSchema);
