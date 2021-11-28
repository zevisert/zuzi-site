/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import {
  UPDATE_PAGE,
  UPDATE_OFFLINE,
  UPDATE_CREDENTIALS,
  SHOW_SNACKBAR,
  HIDE_SNACKBAR,
  UPDATE_ABOUT_TEXT,
} from '../actions/app.js';

const INITIAL_STATE = {
  page: '',
  offline: false,
  about: {
    lines: []
  },
  snackbar: {
    active: false,
    message: ''
  }
};

const app = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_PAGE:
      return {
        ...state,
        page: action.payload.page,
        subPage: action.payload.subPage
      };
    case UPDATE_OFFLINE:
      return {
        ...state,
        offline: action.payload.offline
      };
    case UPDATE_CREDENTIALS:
      return {
        ...state,
        credentials: action.payload.credentials
      };
    case SHOW_SNACKBAR:
    case HIDE_SNACKBAR:
      return {
        ...state,
        snackbar: snackbar(state.snackbar, action)
      };
    case UPDATE_ABOUT_TEXT:
      return {
        ...state,
        about: {
          lines: action.payload.lines
        }
      }
    default:
      return state;
  }
};

export default app;


const snackbar = (state, action) => {
  switch (action.type) {
    case SHOW_SNACKBAR:
      return {
        active: true,
        message: action.payload.message
      };
    case HIDE_SNACKBAR:
      return {
        active: false,
        message: ''
      };
    default:
      return {
        ...state
      };
  }
};
