export const ADMIN_CREATE_ITEM = 'ADMIN_CREATE_ITEM';
export const ADMIN_UPDATE_ITEM = 'ADMIN_UPDATE_ITEM';
export const ADMIN_DELETE_ITEM = 'ADMIN_DELETE_ITEM';

export const ADMIN_GET_ORDERS = 'ADMIN_GET_ORDERS';

export const createItem = data => async dispatch => {

  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }

  const response = await fetch(`${process.env.API_URL}/artwork`, {
    method: "POST",
    body: formData,
    credentials: "same-origin"
  });

  const reply = await response.json();
  const item = reply.post;
  console.log(item);

  dispatch({
    type: ADMIN_CREATE_ITEM,
    payload: {
      item
    }
  });
}

export const editItem = (slug, data) => async dispatch => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }

  const response = await fetch(`${process.env.API_URL}/artwork/${slug}`, {
    method: "PUT",
    body: formData,
    credentials: "same-origin"
  });

  const reply = await response.json();
  const updated = reply.post;
  console.log(updated);

  dispatch({
    type: ADMIN_UPDATE_ITEM,
    payload: {
      updated
    }
  });
}


export const deleteItem = slug => async dispatch => {
  const response = await fetch(`${process.env.API_URL}/artwork/${slug}`, {
    method: "DELETE",
    credentials: "same-origin"
  });

  const updated = await response.json();
  console.log(updated);

  dispatch({
    type: ADMIN_DELETE_ITEM,
    payload: {
      slug
    }
  });
}

export const getOrders = (orderId = '') => async (dispatch, getState) => {

  const state = getState();
  if (Object.keys(state.admin.orders).includes(orderId)) {
    dispatch({
      type: ADMIN_GET_ORDERS,
      payload: {
        orders: state.admin.orders[orderId]
      }
    });
  } else {

    const response = await fetch(`${process.env.API_URL}/orders/${orderId}`, {
      credentials: "same-origin"
    });
    const { orders: ordersList } = await response.json();

    const orders = ordersList.reduce((obj, product) => {
      return {
        ...obj,
        [product._id]: product
      };
    }, {});

    dispatch({
      type: ADMIN_GET_ORDERS,
      payload: {
        orders
      }
    });
  }
}

export const processEtransfer = ({ accepted=false, orderId='', reason=undefined}) => async dispatch => {

  const response = await fetch(`${process.env.API_URL}/etransfer/webhook`, {
    method: "POST",
    credentials: "same-origin",
    headers: new Headers({
      'content-type': 'application/json'
    }),
    body: JSON.stringify({
      accepted,
      orderId,
      reason
    })
  });

  const { orders: ordersList } = await response.json();

  const orders = ordersList.reduce((obj, product) => {
    return {
      ...obj,
      [product._id]: product
    };
  }, {});

  dispatch({
    type: ADMIN_GET_ORDERS,
    payload: {
      orders
    }
  });
}
