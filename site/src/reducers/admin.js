/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { ADMIN_GET_ORDERS } from "../actions/admin.js";

import { createSelector } from "reselect";

const INITIAL_STATE = {
  orders: {},
};

export const admin = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADMIN_GET_ORDERS:
      return {
        ...state,
        orders: {
          ...state.orders,
          ...action.payload.orders,
        },
      };
    default:
      return state;
  }
};

const ordersSelector = (state) => state.admin.orders;

export const orderSelector = (orderId) =>
  createSelector(ordersSelector, (orders) => {
    const order = orders[orderId];
    return order;
  });
