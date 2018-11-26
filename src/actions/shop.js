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
  const response = await fetch(`${process.env.API_URL}/artwork`);

  // You could reformat the data in the right format as well:
  const products = (await response.json()).posts.reduce((obj, product) => {
    obj[product.id] = product
    return obj
  }, {});

  dispatch({
    type: GET_PRODUCTS,
    payload: { products } 
  });
};

export const checkout = () => (dispatch) => {
  // Here you could do things like credit card validation, etc.
  // If that fails, dispatch CHECKOUT_FAILURE. We're simulating that
  // by flipping a coin :)
  const flip = Math.floor(Math.random() * 2);
  if (flip === 0) {
    dispatch({
      type: CHECKOUT_FAILURE
    });
  } else {
    dispatch({
      type: CHECKOUT_SUCCESS
    });
  }
};

export const addToCart = (productId) => (dispatch, getState) =>{
  const state = getState();
  // Just because the UI thinks you can add this to the cart
  // doesn't mean it's in the inventory (user could've fixed it);
  if (state.shop.products[productId].inventory > 0) {
    dispatch(addToCartUnsafe(productId));
  }
};

export const removeFromCart = (productId) => {
  return {
    type: REMOVE_FROM_CART,
    payload: { productId }
  };
};

export const addToCartUnsafe = (productId) => {
  return {
    type: ADD_TO_CART,
    payload: { productId }
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

  console.log(await response.json());

  dispatch(getAllProducts());
}

export const editItem = (id, data) => async dispatch => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }

  const response = await fetch(`${process.env.API_URL}/artwork/${id}`, {
    method: "PUT",
    body: formData
  });

  console.log(await response.json());

  dispatch(getAllProducts());
}


export const deleteItem = key => async dispatch => {
  const response = await fetch(`${process.env.API_URL}/artwork/${key}`, {
    method: "DELETE"
  });

  console.log(await response.text());
  dispatch(getAllProducts());
}
