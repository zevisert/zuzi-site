/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { ADMIN_GET_ORDERS } from "../actions/admin.js";
import { Action } from "../store.js";

import { createSelector } from "reselect";

interface AdminGetOrders extends Action {
  type: typeof ADMIN_GET_ORDERS;
  payload: {
    orders: { [id: string]: unknown };
  };
}

type AdminState = {
  orders: { [id: string]: unknown };
};

const INITIAL_STATE: AdminState = {
  orders: {},
};

export const admin = (state = INITIAL_STATE, action: AdminGetOrders) => {
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

const ordersSelector = (state: { admin: AdminState }) => state.admin.orders;

export const orderSelector = (orderId: string) =>
  createSelector(ordersSelector, (orders: AdminState["orders"]) => {
    const order = orders[orderId];
    return order;
  });
