/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import mongoose from 'mongoose';

export const orderItemSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        min: 1,
    },
    
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    pricing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pricing',
        required: true
     }
});

export const OrderItem = mongoose.model('OrderItem', orderItemSchema);
