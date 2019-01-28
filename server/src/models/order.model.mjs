import mongoose from 'mongoose';
import { orderItemSchema } from './order-item.model';
import { customerSchema } from './customer.model';

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
        max: [10000 * 100, 'Orders cannot exceed $10,000.00']
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
    }
});

export const Order = mongoose.model('Order', orderSchema);
