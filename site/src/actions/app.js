/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import * as appStr from "../components/zuzi-app/strings.js";

export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';
export const UPDATE_CREDENTIALS = 'UPDATE_CREDENTIALS';
export const SHOW_SNACKBAR = 'SHOW_SNACKBAR';
export const HIDE_SNACKBAR = 'HIDE_SNACKBAR';
export const UPDATE_ABOUT_TEXT = 'UPDATE_ABOUT_TEXT';

export const navigate = path => dispatch => {

  if (location.pathname != path) {
    history.pushState(null, null, path);
  }

  // Extract the page name from path.
  const parts = path.slice(1).split('/');
  let page = parts.shift();
  if (page === '/' || page === '') {
    page = appStr.pages.gallery;
  }

  const subPage = parts.join('/');

  // Any other info you might want to extract from the path (like page type),
  // you can do here
  dispatch(loadPage(page, subPage ? subPage : null));
};

const loadPage = (page, subPage) => dispatch => {
  switch(page) {
    case appStr.pages.about:
      import('../components/about/index.js');
      break;
    case appStr.pages.gallery:
      if (subPage) {
        import('../components/gallery/gallery-item.js');
      } else {
        import('../components/gallery/index.js');
      }
      break;
    case appStr.pages.cart:
      import('../components/cart/index.js');
      break;
    case appStr.pages.tour:
        import('../components/virtual-tour/index.js');
        break;
    case appStr.pages.admin:
      if (subPage) {
        if (subPage === 'change-password') {
          import('../components/admin/change-password.js');
        } else if (subPage.split('/').includes('orders')) {
          import('../components/admin/orders.js');
        } else {
          import('../components/admin/edit.js');
        }
      } else {
        import('../components/admin/index.js');
      }
      break;
    case appStr.pages.login:
      import('../components/admin/login.js');
      break;
    default:
      page = appStr.pages.none;
      import('../components/no-view/index.js');
  }

  dispatch(updatePage(page, subPage));
};

const updatePage = (page, subPage) => {
  return {
    type: UPDATE_PAGE,
    payload: { page, subPage }
  };
};

export const updateOffline = offline => (dispatch, getState) => {
  dispatch({
    type: UPDATE_OFFLINE,
    payload: { offline }
  });
};

export const updateLayout = (medium, wide) => (dispatch, getState) => {
  let size = 'narrow';

  if (wide) {
    size = 'wide'
  } else if (medium) {
    size = 'medium'
  }

  console.log(`The window changed to a ${size} layout`);
};

export const login = ({email, password}) => async (dispatch, getState) => {

  try {

    const loginReq = await fetch(`${window.process.env.API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: new Headers({'content-type': 'application/json'}),
      body: JSON.stringify({
        email,
        password
      })
    });

    const response = await loginReq.json();
    if (response.error) {
      throw new Error(response.error);
    }

    const params = (new URL(document.location)).searchParams;
    const path = params.has('referrer') ? params.get('referrer') : '/admin';

    if (response.email === email) {
      dispatch(credentials(response));
      dispatch(navigate(path));
    }

  } catch (err) {
    dispatch(showSnackbar(err.message));
  }
};

export const credentials = credentials => {
  sessionStorage.setItem('credentials', JSON.stringify(credentials));
  return {
    type: UPDATE_CREDENTIALS,
    payload: {
      credentials
    }
  };
};

export const showSnackbar = message => {
  if (message) {
    return {
      type: SHOW_SNACKBAR,
      payload: {
        message
      }
    };
  } else {
    throw new Error('No snackbar message');
  }
}

export const hideSnackbar = () => {
  return {
    type: HIDE_SNACKBAR,
    payload: {

    }
  }
}

export const getAboutText = () => async dispatch => {
  const aboutTextReq = await fetch(`${window.process.env.API_URL}/about/text`, {
    method: 'GET',
    credentials: 'same-origin',
    headers: new Headers({'content-type': 'application/json'})
  });

  const { lines: about_lines } = await aboutTextReq.json();

  dispatch({
    type: UPDATE_ABOUT_TEXT,
    payload: {
      lines: about_lines
    }
  });
}

export const updateAboutText = lines => async dispatch => {

  const textUpdateReq = await fetch(`${window.process.env.API_URL}/about/text`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: new Headers({'content-type': 'application/json'}),
    body: JSON.stringify({
      lines
    })
  });

  const { lines: about_lines } = await textUpdateReq.json();

  dispatch({
    type: UPDATE_ABOUT_TEXT,
    payload: {
      lines: about_lines
    }
  });

  dispatch(showSnackbar("About page text updated"));
}
