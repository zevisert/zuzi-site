import mongoose from 'mongoose';

export const orderItemSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        min: 0,
    },
    
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    pricing: { type: mongoose.Schema.Types.ObjectId, ref: 'Pricing' }
});

export const OrderItem = mongoose.model('OrderItem', orderItemSchema);
