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
export const ADMIN_CREATE_ITEM = 'ADMIN_CREATE_ITEM';
export const ADMIN_UPDATE_ITEM = 'ADMIN_UPDATE_ITEM';
export const ADMIN_DELETE_ITEM = 'ADMIN_DELETE_ITEM';

export const getAllProducts = () => async (dispatch) => {
  // Here you would normally get the data from the server. We're simulating
  // that by dispatching an async action (that you would dispatch when you
  // succesfully got the data back)
  const response = await fetch(`${process.env.API_URL}/artwork`);

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

export const checkout = (params, mount) => async dispatch => {

  const query = Object.entries(params).map(([key, value]) => {
    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }).join('&');

  const response = await fetch(`${process.env.API_URL}/checkout/intent?${query}`);
  const reply = await response.json();
  const clientSecret = reply.client_secret;

  const stripe = Stripe(process.env.STRIPE_PK, {
    betas: ['payment_intent_beta_3']
  });

  try {
    const result = await stripe.handleCardPayment(clientSecret, mount);
    if (result.error) {
      throw result.error;
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


export const createItem = data => async dispatch => {

  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }

  const response = await fetch(`${process.env.API_URL}/artwork`, {
    method: "POST",
    body: formData
  });

  const reply = await response.json();
  const item = reply.post;
  console.log(item);

  dispatch({
    type: ADMIN_CREATE_ITEM,
    payload: { item }
  });
}

export const editItem = (slug, data) => async dispatch => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }

  const response = await fetch(`${process.env.API_URL}/artwork/${slug}`, {
    method: "PUT",
    body: formData
  });

  const reply = await response.json();
  const updated = reply.post;
  console.log(updated);

  dispatch({
    type: ADMIN_UPDATE_ITEM,
    payload: { updated }
  });
}


export const deleteItem = slug => async dispatch => {
  const response = await fetch(`${process.env.API_URL}/artwork/${slug}`, {
    method: "DELETE"
  });

  const updated = await response.json();
  console.log(updated);

  dispatch({
    type: ADMIN_DELETE_ITEM,
    payload: { slug }
  });
}
