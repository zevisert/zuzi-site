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
} from "../actions/app.js";

import { Action } from "../store.js";

interface UpdatePageAction extends Action {
  type: typeof UPDATE_PAGE;
  payload: {
    page: string;
    subPage: string;
  };
}
interface UpdateOfflineAction extends Action {
  type: typeof UPDATE_OFFLINE;
  payload: {
    offline: boolean;
  };
}
interface UpdateCredentialsAction extends Action {
  type: typeof UPDATE_CREDENTIALS;
  payload: {
    credentials: string;
  };
}
interface UpdateSnackbarAction extends Action {
  type: typeof SHOW_SNACKBAR | typeof HIDE_SNACKBAR;
  payload: {
    active: boolean;
    message: string;
  };
}
interface UpdateAboutTextAction extends Action {
  type: typeof UPDATE_ABOUT_TEXT;
  payload: {
    lines: string[];
  };
}
type SnackbarState = {
  active: boolean;
  message: string;
};

type AppState = {
  page: string;
  subPage: string;
  credentials: string | null;
  offline: boolean;
  about: {
    lines: string[];
  };
  snackbar: SnackbarState;
};

const INITIAL_STATE: AppState = {
  page: "",
  subPage: "",
  credentials: null,
  offline: false,
  about: {
    lines: [],
  },
  snackbar: {
    active: false,
    message: "",
  },
};

const app = (
  state = INITIAL_STATE,
  action:
    | UpdatePageAction
    | UpdateOfflineAction
    | UpdateCredentialsAction
    | UpdateSnackbarAction
    | UpdateAboutTextAction
): AppState => {
  switch (action.type) {
    case UPDATE_PAGE:
      return {
        ...state,
        page: action.payload.page,
        subPage: action.payload.subPage,
      };
    case UPDATE_OFFLINE:
      return {
        ...state,
        offline: action.payload.offline,
      };
    case UPDATE_CREDENTIALS:
      return {
        ...state,
        credentials: action.payload.credentials,
      };
    case SHOW_SNACKBAR:
    case HIDE_SNACKBAR:
      return {
        ...state,
        snackbar: snackbar(state.snackbar, action),
      };
    case UPDATE_ABOUT_TEXT:
      return {
        ...state,
        about: {
          lines: action.payload.lines,
        },
      };
    default:
      return state;
  }
};

export default app;

const snackbar = (
  state: SnackbarState,
  action: UpdateSnackbarAction
): SnackbarState => {
  switch (action.type) {
    case SHOW_SNACKBAR:
      return {
        active: true,
        message: action.payload.message,
      };
    case HIDE_SNACKBAR:
      return {
        active: false,
        message: "",
      };
    default:
      return {
        ...state,
      };
  }
};
