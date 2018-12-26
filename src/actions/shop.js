/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

export const GET_PRODUCTS = 'GET_PRODUCTS';
export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const CHECKOUT_SUCCESS = 'CHECKOUT_SUCCESS';
export const CHECKOUT_FAILURE = 'CHECKOUT_FAILURE';

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

  const response = await fetch(`${process.env.API_URL}/stripe/checkout/intent`, {
    method: "POST",
    credentials: "same-origin",
    headers: new Headers({'content-type': 'application/json'}),
    body: JSON.stringify({amount, metadata})
  });

  const { client_secret } = await response.json();

  const stripe = process.stripe;
  if (!stripe) {
    dispatch(checkoutFailed(`Sorry. Stripe hasn't loaded. Try again?`));
    return;
  }

  try {
    const { error } = await stripe.handleCardPayment(
      client_secret, card, {
        source_data: {
          owner: { name: metadata.customer.name }
        }
      }
    );

    if (error) {
      throw error;
    }

    dispatch({
      type: CHECKOUT_SUCCESS
    });

  } catch (error) {
    dispatch({
      type: CHECKOUT_FAILURE,
      payload: { error }
    });
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

  dispatch({
    type: CHECKOUT_SUCCESS,
    payload: { message: 'Your order has been submitted' }
  });
};

export const checkoutFailed = message => {
  return {
    type: CHECKOUT_FAILURE,
    payload: { error: { message } }
  }
};

export const addToCart = (productId, pricing) => (dispatch, getState) =>{
  const state = getState();
  // Just because the UI thinks you can add this to the cart
  // doesn't mean it's in the inventory (user could've fixed it);
  dispatch(addToCartUnsafe(productId, pricing));
};

export const removeFromCart = (cartKey) => {
  return {
    type: REMOVE_FROM_CART,
    payload: { cartKey }
  };
};

export const addToCartUnsafe = (productId, pricing) => {
  const pricingId = pricing._id;
  return {
    type: ADD_TO_CART,
    payload: { productId, pricingId, pricing }
  };
};
