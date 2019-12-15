/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import {
  GET_PRODUCTS,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  CHECKOUT_SUCCESS,
  CHECKOUT_FAILURE,
  CHECKOUT_STAGE,
  CHECKOUT_METHOD,
  CHECKOUT_STAGES_ENUM,
  CHECKOUT_METHODS_ENUM,
} from '../actions/shop.js';

import {
  ADMIN_CREATE_ITEM,
  ADMIN_DELETE_ITEM,
  ADMIN_UPDATE_ITEM
} from '../actions/admin.js';

import { createSelector } from 'reselect';

const INITIAL_STATE = {
  products: {},
  cart: {},
  stage: CHECKOUT_STAGES_ENUM.CART,
  method: CHECKOUT_METHODS_ENUM.STRIPE,
  error: '',
  message: ''
};

const shop = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GET_PRODUCTS:
      return {
        ...state,
        products: action.payload.products
      };
    case CHECKOUT_SUCCESS:
      return {
        ...state,
        cart: cart(state.cart, action),
        error: '',
        message: action.payload ? action.payload.message : '',
      }
    case ADD_TO_CART:
    case REMOVE_FROM_CART:
      return {
        ...state,
        cart: cart(state.cart, action),
        stage: CHECKOUT_STAGES_ENUM.CART,
        error: '',
        message: action.payload ? action.payload.message : ''
      };
    case CHECKOUT_STAGE:
      return {
        ...state,
        stage: action.payload.stage
      };
    case CHECKOUT_METHOD:
      return {
        ...state,
        method: action.payload.method
      };
    case CHECKOUT_FAILURE:
      return {
        ...state,
        error: action.payload.error,
      };
    case ADMIN_CREATE_ITEM:
      return {
        ...state,
        products: {
          ...state.products,
          [action.payload.item._id]: action.payload.item
        }
      };
    case ADMIN_DELETE_ITEM:
      return {
        ...state,
        products: Object.entries(state.products)
          .filter(([key, value]) => value.slug !== action.payload.slug)
          .reduce((obj, [key, value]) => { return { ...obj, [key]: value } }, {})
      };
    case ADMIN_UPDATE_ITEM:
      return {
        ...state,
        products: {
          ...state.products,
          [action.payload.updated._id]: action.payload.updated
        }
      };
    default:
      return state;
  }
};

// Slice reducer: it only reduces the bit of the state it's concerned about.
const cart = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      const key = `${action.payload.productId}-${action.payload.pricingId}`;
      return {
        ...state,
        [key]: {
          quantity: (state[key] ? state[key].quantity : 0) + action.payload.quantity,
          productId: action.payload.productId,
          pricing: action.payload.pricing
        }
      };
    }
    case REMOVE_FROM_CART: {
      return Object.entries(state)
        .map(([key, value]) => key === action.payload.cartKey
                                ? [key, { ...value, quantity: value.quantity - 1 }]
                                : [key, value])
        .filter(([key, value]) => value.quantity > 0)
        .reduce((obj, [key, value]) => { return { ...obj, [key]: value } }, {});
    }
    case CHECKOUT_SUCCESS:
      return {};
    default:
      return state;
  }
};

export default shop;




// Per Redux best practices, the shop data in our store is structured
// for efficiency (small size and fast updates).
//
// The _selectors_ below transform store data into specific forms that
// are tailored for presentation. Putting this logic here keeps the
// layers of our app loosely coupled and easier to maintain, since
// views don't need to know about the store's internal data structures.
//
// We use a tiny library called `reselect` to create efficient
// selectors. More info: https://github.com/reduxjs/reselect.

const cartSelector = state => state.shop.cart;
const productsSelector = state => state.shop.products;
const subPageSelector = state => state.app.subPage;

export const selectedItemSelector = createSelector(
  subPageSelector,
  productsSelector,
  (subPage, products) => {
    const item = Object.values(products).filter(prod => prod.slug === subPage).pop();
    return [item, subPage];
  }
)

export const givenItemSelector = key => createSelector(
  productsSelector,
  (products) => {
    const item = products[key];
    return item;
  }
)

// Return a flattened array representation of the items in the cart
export const cartItemsSelector = createSelector(
  cartSelector,
  productsSelector,
  (cart, products) => {
    return Object.entries(cart)
      .map(([cartKey, cartContents])=> {

        const item = products[cartContents.productId];
        const size = cartContents.pricing.size;
        return {
          preview: item.preview,
          label: `${item.title} (${cartContents.pricing.medium} [${size.width}x${size.height} ${size.unit}])`,
          amount: cartContents.quantity,
          price: cartContents.pricing.price,
          key: cartKey
        };
      });
  }
);

// Return the total cost of the items in the cart
export const cartTotalSelector = createSelector(
  cartSelector,
  cart => {
    let total = 0;
    Object.values(cart).forEach(cartContent => {
      total += cartContent.pricing.price * cartContent.quantity;
    });
    return Math.round(total * 100) / 100;
  }
);

// Return the number of items in the cart
export const cartQuantitySelector = createSelector(
  cartSelector,
  cart => {
    let num = 0;
    Object.values(cart).forEach(cartContent => {
      num += cartContent.quantity;
    });
    return num;
  }
);
