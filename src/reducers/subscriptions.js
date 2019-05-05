/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import {
  EMAIL_SUBSCRIBE,
  EMAIL_UNSUBSCRIBE,
  SERVICE_WORKER_SUBSCRIBE,
  SERVICE_WORKER_UNSUBSCRIBE,
  SERVICE_WORKER_REGISTER,
  SERVICE_WORKER_UNREGISTER
} from '../actions/subscriptions.js';

const INITIAL_STATE = {
  push: {
    subscribed: false,
    registration: null,
    subscription: null
  },
  email: {
    subscribed: false,
    address: null
  }
};

export const subscriptions = (state = INITIAL_STATE, action) => {
  switch (action.type) {

    case EMAIL_SUBSCRIBE:
    case EMAIL_UNSUBSCRIBE:
      return {
        ...state,
        email: email(state.email, action)
      };
    case SERVICE_WORKER_SUBSCRIBE:
    case SERVICE_WORKER_UNSUBSCRIBE:
    case SERVICE_WORKER_REGISTER:
    case SERVICE_WORKER_UNREGISTER:
      return {
        ...state,
        push: push(state.push, action)
      };
    default:
      return state;
  }
};


const email = (state, action) => {
  switch (action.type) {
    case EMAIL_SUBSCRIBE:
      return {
        subscribed: true,
        address: action.payload.email
      };
    case EMAIL_UNSUBSCRIBE:
      return {
        subscribed: false,
        address: null
      };
    default:
      return {
        ...state
      };
  }
};

const push = (state, action) => {
  switch (action.type) {
    case SERVICE_WORKER_REGISTER:
      return {
        ...state,
        registration: action.payload.registration
      };
    case SERVICE_WORKER_UNREGISTER:
      return {
        ...state,
        registration: null,
        subscription: null,
        subscribed: false
      };
    case SERVICE_WORKER_SUBSCRIBE:
      return {
        ...state,
        subscribed: true,
        subscription: action.payload.subscription
      };
    case SERVICE_WORKER_UNSUBSCRIBE:
      return {
        ...state,
        subscribed: false,
        subscription: null
      };
    default:
      return {
        ...state
      };
  }
};
