/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import mongoose from 'mongoose';

export const subscriptionSchema = new mongoose.Schema({
    endpoint: {
        type: String,
        unique: true,
        required: [true, 'Must supply push subscription endpoint when creating subscription model']
    },
    expirationTime: {
        type: Object
    },
    keys: {
        type: Object,
        required: [true, 'Subscription must have encryption keys supplied']
    }
});

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
