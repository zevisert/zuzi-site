/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { showSnackbar } from "./app";

export const SERVICE_WORKER_SUBSCRIBE = "SERVICE_WORKER_SUBSCRIBE";
export const SERVICE_WORKER_UNSUBSCRIBE = "SERVICE_WORKER_UNSUBSCRIBE";
export const SERVICE_WORKER_REGISTER = "SERVICE_WORKER_REGISTER";
export const SERVICE_WORKER_UNREGISTER = "SERVICE_WORKER_UNREGISTER";
export const EMAIL_SUBSCRIBE = "EMAIL_SUBSCRIBE";
export const EMAIL_UNSUBSCRIBE = "EMAIL_UNSUBSCRIBE";

export const createEmailSubscriber = (email) => async (dispatch) => {
  const createUserReq = await fetch(`${window.process.env.API_URL}/subscriber/create`, {
    method: "POST",
    credentials: "same-origin",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      email,
    }),
  });

  const { success } = await createUserReq.json();

  if (success) {
    dispatch(showSnackbar("You are now subscribed to new posts via email"));
  } else {
    dispatch(showSnackbar("Something went wrong, you are not subscribed"));
  }

  dispatch({
    type: EMAIL_SUBSCRIBE,
    payload: { email },
  });
};

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");

  return Uint8Array.from(
    atob(base64)
      .split("")
      .map((c) => c.charCodeAt(0))
  );
}

export const createPushSubscriber = () => async (dispatch, getState) => {
  const applicationServerKey = urlB64ToUint8Array(process.env.PUSH_PUBKEY);
  const state = getState();
  if (state.subscriptions.push.registered) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      dispatch(syncPushSubToServer(subscription));

      dispatch({
        type: SERVICE_WORKER_SUBSCRIBE,
        payload: { subscription },
      });
    } catch (err) {
      console.warn(`Failed to subscribe the user: ${err}`);
      dispatch(removePushSubscriber());
    }
  } else {
    console.error("Service worker not registered");
  }
};

export const syncPushSubToServer = (subscription) => async (dispatch) => {
  const createUserReq = await fetch(`${window.process.env.API_URL}/subscriber/create`, {
    method: "POST",
    credentials: "same-origin",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      subscription,
    }),
  });

  const { success, isNew } = await createUserReq.json();

  if (subscription) {
    if (success && isNew) {
      dispatch(
        showSnackbar("You will now receive notifications when new artwork is added!")
      );
    } else if (!success) {
      dispatch(showSnackbar("Something went wrong, you are not subscribed"));
    }
  }
};

export const removePushSubscriber = () => async (dispatch) => {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    subscription.unsubscribe();
  }

  dispatch(syncPushSubToServer(null));
  dispatch({
    type: SERVICE_WORKER_UNSUBSCRIBE,
  });
};

export const updatePushRegistration = (registration = null) => {
  if (registration) {
    return {
      type: SERVICE_WORKER_REGISTER,
      payload: { registration },
    };
  } else {
    return {
      type: SERVICE_WORKER_UNREGISTER,
    };
  }
};
