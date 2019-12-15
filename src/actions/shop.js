/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { showSnackbar } from "./app";

export const GET_PRODUCTS = 'GET_PRODUCTS';
export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const CHECKOUT_SUCCESS = 'CHECKOUT_SUCCESS';
export const CHECKOUT_FAILURE = 'CHECKOUT_FAILURE';
export const CHECKOUT_STAGE = 'CHECKOUT_STAGE';
export const CHECKOUT_METHOD = 'CHECKOUT_METHOD';


export const CHECKOUT_STAGES_ENUM = {
  CART: 1,
  PAYMENT_MODE: 2,
  CHECKOUT: 3,
  SUCCESS: 4,
  properties: {
    1: { name: "CART", value: 1, next: 2, prev: 1 },
    2: { name: "PAYMENT_MODE", value: 2, next: 3, prev: 1 },
    3: { name: "CHECKOUT", value: 3, next: 4, prev: 2 },
    4: { name: "SUCCESS", value: 4, next: 1, prev: 4 },
  }
};

export const CHECKOUT_METHODS_ENUM = {
  STRIPE: 1,
  ETRANSFER: 2,
  properties: {
    1: { name: "Credit Card", value: 1 },
    2: { name: "E-Transfer", value: 2 }
  }
}

export const getAllProducts = () => async (dispatch) => {
  // Here you would normally get the data from the server. We're simulating
  // that by dispatching an async action (that you would dispatch when you
  // succesfully got the data back)
  const response = await fetch(`${process.env.API_URL}/artwork`, {
    credentials: "same-origin"
  });

  // You could reformat the data in the right format as well:
  const products = (await response.json()).posts.reduce((obj, product) => {
    obj[product._id] = product;
    return obj;
  }, {});

  dispatch({
    type: GET_PRODUCTS,
    payload: { products }
  });
};

export const checkoutStripe = (card, { amount, metadata }) => async dispatch => {

  const stripe = process.stripe;
  if (!stripe) {
    dispatch(showSnackbar(`Sorry. Card checkout hasn't loaded. Try again?`));
    return;
  }

  const response = await fetch(`${process.env.API_URL}/stripe/checkout/intent`, {
    method: "POST",
    credentials: "same-origin",
    headers: new Headers({ 'content-type': 'application/json' }),
    body: JSON.stringify({ amount, metadata })
  });

  const reply = await response.json();

  if (reply.client_secret) {

    const { error } = await stripe.handleCardPayment(
      reply.client_secret, card, {
        source_data: {
          owner: {
            name: metadata.customer.name
          }
        }
      }
    );

    if (error) {
      dispatch(showSnackbar(error.message));
    } else {
      dispatch(checkoutSuccess());
      dispatch(showSnackbar('Your order has been submitted.'));
    }
  } else if (reply.errors) {
    for (const value of Object.values(reply.errors)) {
      if (value.kind) {
        dispatch(checkoutFailed(value.message));
        break;
      }
    }
  } else {
    dispatch(checkoutFailed('Something went wrong while processing your order.'));
  }
};

export const checkoutEtransfer = ({amount, metadata}) => async dispatch => {
  const response = await fetch(`${process.env.API_URL}/etransfer/checkout`, {
    method: "POST",
    credentials: "same-origin",
    headers: new Headers({'content-type': 'application/json'}),
    body: JSON.stringify({amount, metadata})
  });

  const reply = await response.json();

  if (reply.success) {
    dispatch(checkoutSuccess());
    dispatch(showSnackbar('Your order has been submitted.'));
  } else if (reply.errors) {
    for (const value of Object.values(reply.errors)) {
      if (value.kind) {
        dispatch(checkoutFailed(value.message));
        break;
      }
    }
  } else {
    dispatch(checkoutFailed('Something went wrong while processing your order.'));
  }
};

export const checkoutSuccess = message => async dispatch => {
  dispatch({ type: CHECKOUT_SUCCESS, payload: { message }});
  dispatch(advanceCheckout());
}

export const checkoutFailed = message => async dispatch => {
  dispatch(showSnackbar(message));
  dispatch({
    type: CHECKOUT_FAILURE,
    payload: { error: { message } }
  });
};

export const addToCart = (productId, pricing, quantity=1) => (dispatch, getState) =>{
  const state = getState();
  // Just because the UI thinks you can add this to the cart
  // doesn't mean it's in the inventory (user could've fixed it);
  dispatch(addToCartUnsafe(productId, pricing, quantity));
};

export const removeFromCart = (cartKey) => {
  return {
    type: REMOVE_FROM_CART,
    payload: { cartKey }
  };
};

export const addToCartUnsafe = (productId, pricing, quantity) => {
  const pricingId = pricing._id;
  return {
    type: ADD_TO_CART,
    payload: { productId, pricingId, pricing, quantity }
  };
};

export const advanceCheckout = () => (dispatch, getState) => {
  const stage = getState().shop.stage;
  const next = stage => CHECKOUT_STAGES_ENUM.properties[stage].next;
  dispatch(setCheckoutStage(next(stage)));
}

export const retreatCheckout = () => (dispatch, getState) => {
  const stage = getState().shop.stage;
  const prev = stage => CHECKOUT_STAGES_ENUM.properties[stage].prev;
  dispatch(setCheckoutStage(prev(stage)));
}

export const setCheckoutStage = (stage) => {
  return {
    type: CHECKOUT_STAGE,
    payload: { stage }
  }
}

export const setCheckoutMethod = (method) => {
  return {
    type: CHECKOUT_METHOD,
    payload: { method }
  }
}
