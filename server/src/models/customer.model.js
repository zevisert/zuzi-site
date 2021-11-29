/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 */

import mongoose from "mongoose";

const isEmail = (string) =>
  new RegExp(
    [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))/,
      /@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    ]
      .map((part) => part.source)
      .join("")
  ).test(string);

export const shippingInfoSchema = new mongoose.Schema({
  address_lines: {
    type: [String],
    validate: {
      validator: function (value) {
        return value.length > 0 && value.length < 5;
      },
      message: (props) => {
        if (props.length === 0) {
          return `Street address is missing`;
        } else {
          return `Street address is too many lines`;
        }
      },
    },
  },
  postal_code: {
    type: String,
    required: [true, "Postal code is required"],
  },

  locality: {
    type: String,
    required: [true, "City or town is required"],
  },

  region: {
    type: String,
    required: [true, "Province or state is required"],
  },

  country: {
    type: String,
    required: [true, "Country is required"],
  },
});

export const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Your name is required"],
    minlength: [3, "Name is too short"],
    maxlength: [100, "Name is too long"],
  },

  email: {
    type: String,
    required: [true, "A contact email address is required"],
    validate: {
      validator: function (value) {
        return isEmail(value);
      },
      message: (props) => `${props.value} is not a valid email`,
    },
  },

  shipping: {
    type: shippingInfoSchema,
    required: [true, "Shipping information missing"],
  },
});

export const Customer = mongoose.model("Customer", customerSchema);
