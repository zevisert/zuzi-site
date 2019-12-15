/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import mongoose from 'mongoose';
import { orderItemSchema } from './order-item.model';
import { mailingSchema } from './mailing.model';
import { customerSchema } from './customer.model';
import { Pricing } from './pricing.model.mjs';

export const orderSchema = new mongoose.Schema({
    items: {
        type: [orderItemSchema],
        validate: {
            validator: function (value) {
                return value.length > 0;
            },
            message: params => `Order contains no items`
        }
    },

    totalCents: {
        type: Number,
        min: [1, 'Order must cost more than 0'],
        max: [10000 * 100, 'Orders cannot exceed $10,000.00'],
        validate: {
            validator: function (value) {
                return new Promise( async (resolve, reject) => {
                    try {
                        const itemPricings = await Promise.all(this.items.map(item => {
                            return Pricing.findById( item.pricing ).then(pricing => {
                                return {
                                    pricing,
                                    quantity: item.quantity
                                }
                            });
                        }));

                        const shouldCost = itemPricings
                            .map(({ pricing, quantity }) => quantity * pricing.price)
                            .reduce((acc, val) => acc + 100 * val, 0);

                        resolve(value === shouldCost);
                    } catch (error) {
                        reject(error);
                    }
                });
            },
            message: params => `Order price not properly received`
        }
    },

    customer: {
        type: customerSchema,
        required: [true, 'Order with no customer information']
    },

    type: {
        type: String,
        enum: ['stripe', 'etransfer'],
        required: [true, 'Order payment type is missing']
    },

    intent_id: {
        type: String,
        required: false
    },

    status: {
        type: String,
        enum: ['pending', 'paid', 'rejected'],
        default: 'pending'
    },

    date: {
        type: Date,
        required: [true, 'Order must have date it was placed'],
    },

    info: {
        type: String,
        required: false
    },

    receipt: {
        type: String,
        required: false,
        default: null
    },

    mailings: {
        type: [mailingSchema],
        required: false,
        default: []
    }
});

export const Order = mongoose.model('Order', orderSchema);
