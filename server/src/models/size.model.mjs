import mongoose from 'mongoose';

export const sizeSchema = new mongoose.Schema({
    width: {
        type: Number,
        required: [true, 'A width is required'],
        min: [1, 'Width must be at least 1']
    },

    height: {
        type: Number,
        required: [true, 'A height is required'],
        min: [1, 'Height must be at least 1']
    },

    unit: {
        type: String,
        enum: ['cm', 'in', 'm', 'ft'],
        default: 'cm',
        required: [true, 'Measurement unit is not specified']
    }
});

export const Size = mongoose.model('Size', sizeSchema);
