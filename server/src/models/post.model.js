/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import mongoose from 'mongoose';
import { pricingSchema } from './pricing.model.js';
import { pre_save } from './hooks/post.hooks.js';

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

    display_position: {
        type: Number,
        default: 50 // %
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

postSchema.pre('save', pre_save)

export const Post = mongoose.model('Post', postSchema);
