/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { showSnackbar } from "./app.js";
import { AppDispatch, RootState } from "../store.js";

export const ADMIN_CREATE_ITEM = "ADMIN_CREATE_ITEM";
export const ADMIN_UPDATE_ITEM = "ADMIN_UPDATE_ITEM";
export const ADMIN_DELETE_ITEM = "ADMIN_DELETE_ITEM";
export const ADMIN_GET_ORDERS = "ADMIN_GET_ORDERS";

interface Pricing {
  price: number;
  available: boolean;
  medium: string;
  size: {
    width: number;
    height: number;
    unit: "in";
  };
}

interface ItemMetadata {
  title: string;
  description: string;
  tags: string[];
  pricings: Pricing[];
  active: boolean;
  display_position: number;
  should_watermark: boolean;
}

export const createItem =
  (
    data: ItemMetadata,
    image: File,
    onProgress: (ev: ProgressEvent<EventTarget>) => void,
    done: () => void
  ) =>
  async (dispatch: AppDispatch) => {
    const formData = new FormData();

    formData.append(
      "metadata",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    formData.append("image", image);

    const ajax = new XMLHttpRequest();
    ajax.open("POST", `${process["env"].API_URL}/artwork`);
    ajax.responseType = "json";

    ajax.upload.onprogress = onProgress;

    ajax.onabort = () => {
      done();
      dispatch(showSnackbar(`Upload aborted for ${data.title}`));
    };
    ajax.onerror = () => {
      done();
      dispatch(showSnackbar("Request failed"));
    };

    ajax.onload = () => {
      done();
      if (ajax.status != 200) {
        const { error } = ajax.response;
        const fields = Object.keys(error.errors).filter((field) => field !== "slug");
        const message = `${fields.join(", ")} ${
          fields.length === 1 ? "is" : "are"
        } not valid`;

        dispatch(showSnackbar(message));
      } else {
        const reply = ajax.response;
        const item = reply.post;

        dispatch({
          type: ADMIN_CREATE_ITEM,
          payload: {
            item,
          },
        });

        dispatch(showSnackbar("Item saved"));
      }
    };

    ajax.send(formData);
  };

export const editItem =
  (
    slug: string,
    data: ItemMetadata,
    image: File,
    onProgress: (ev: ProgressEvent<EventTarget>) => void,
    done: () => void
  ) =>
  async (dispatch: AppDispatch) => {
    const formData = new FormData();

    formData.append(
      "metadata",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    if (image !== undefined) {
      formData.append("image", image);
    }

    const ajax = new XMLHttpRequest();
    ajax.open("PUT", `${process["env"].API_URL}/artwork/${slug}`);
    ajax.responseType = "json";

    ajax.upload.onprogress = onProgress;

    ajax.onabort = () => {
      done();
      dispatch(showSnackbar(`Upload aborted for ${data.title}`));
    };
    ajax.onerror = () => {
      done();
      dispatch(showSnackbar("Request failed"));
    };

    ajax.onload = () => {
      done();
      if (ajax.status != 200) {
        const { error } = ajax.response;
        const fields = Object.keys(error.errors).filter((field) => field !== "slug");
        const message = `${fields.join(", ")} ${
          fields.length === 1 ? "is" : "are"
        } not valid`;

        dispatch(showSnackbar(message));
      } else {
        const reply = ajax.response;
        const updated = reply.post;
        console.log(updated);

        dispatch({
          type: ADMIN_UPDATE_ITEM,
          payload: {
            updated,
          },
        });

        dispatch(showSnackbar("Item saved"));
      }
    };

    ajax.send(formData);
  };

export const deleteItem = (slug: string) => async (dispatch: AppDispatch) => {
  const response = await fetch(`${process["env"].API_URL}/artwork/${slug}`, {
    method: "DELETE",
    credentials: "same-origin",
  });

  const updated = await response.json();
  console.log(updated);

  dispatch({
    type: ADMIN_DELETE_ITEM,
    payload: {
      slug,
    },
  });
};

export const getOrders =
  (orderId: string = "") =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    if (Object.keys(state.admin.orders).includes(orderId)) {
      dispatch({
        type: ADMIN_GET_ORDERS,
        payload: {
          orders: state.admin.orders[orderId],
        },
      });
    } else {
      const response = await fetch(`${process["env"].API_URL}/orders/${orderId}`, {
        credentials: "same-origin",
      });
      const { orders: ordersList } = await response.json();

      const orders = ordersList.reduce((obj, product) => {
        return {
          ...obj,
          [product._id]: product,
        };
      }, {});

      dispatch({
        type: ADMIN_GET_ORDERS,
        payload: {
          orders,
        },
      });
    }
  };

export const processEtransfer =
  ({ accepted = false, orderId = "", reason = undefined }) =>
  async (dispatch: AppDispatch) => {
    const response = await fetch(`${process["env"].API_URL}/etransfer/webhook`, {
      method: "POST",
      credentials: "same-origin",
      headers: new Headers({
        "content-type": "application/json",
      }),
      body: JSON.stringify({
        accepted,
        orderId,
        reason,
      }),
    });

    const { order, error } = await response.json();

    if (error) {
      dispatch(showSnackbar(error));
      return;
    }

    dispatch({
      type: ADMIN_GET_ORDERS,
      payload: {
        orders: {
          [order._id]: order,
        },
      },
    });
  };

export const changePassword =
  (email: string, oldPassword: string, newPassword: string) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await fetch(`${process["env"].API_URL}/auth/change-password`, {
        credentials: "same-origin",
        method: "POST",
        headers: new Headers({ "content-type": "application/json" }),
        body: JSON.stringify({
          email,
          oldPassword,
          newPassword,
        }),
      });

      if (response.redirected) {
        location.assign(response.url);
      } else {
        throw new Error("Expected password change to redirect");
      }
    } catch (err) {
      console.log(err);
      dispatch(showSnackbar("Failed to change password"));
    }
  };
