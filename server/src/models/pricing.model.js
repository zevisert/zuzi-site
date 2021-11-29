/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 */

import mongoose from "mongoose";
import { sizeSchema } from "./size.model.js";

export const pricingSchema = new mongoose.Schema({
  price: {
    type: Number,
    min: [1, "Pricing must be greater than $1.00"],
  },

  size: {
    type: sizeSchema,
    required: [true, "A sizing is required"],
  },

  medium: {
    type: String,
    required: [
      true,
      "The medium this artwork posting is presented in is required",
    ],
  },

  available: {
    type: Boolean,
    default: true,
    required: [true, "This pricing must have an availability of true or false"],
  },
});

export const Pricing = mongoose.model("Pricing", pricingSchema);
