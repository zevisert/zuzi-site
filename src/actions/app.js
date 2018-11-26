/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import * as appStr from "../components/zuzi-app/strings.js";

export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';
export const UPDATE_CREDENTIALS = 'UPDATE_CREDENTIALS';

export const navigate = (path) => (dispatch) => {
  
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

const loadPage = (page, subPage) => (dispatch) => {
  switch(page) {
    case appStr.pages.about:
      import('../components/about/index.js').then((module) => {
        // Put code in here that you want to run every time when
        // navigating to view1 after my-view1.js is loaded.
      });
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
    case appStr.pages.admin:
      if (subPage) {
        import('../components/admin/edit.js');
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

export const updateOffline = (offline) => (dispatch, getState) => {
  dispatch({
    type: UPDATE_OFFLINE,
    payload: { offline }
  });
};

export const updateLayout = (wide) => (dispatch, getState) => {
  console.log(`The window changed to a ${wide ? 'wide' : 'narrow'} layout`);
};

export const login =  ({username, password}) => async (dispatch, getState) => {

  try {

    const loginReq = await fetch(`${window.process.env.API_URL}/auth/login`, {
      method: 'POST',
      headers: new Headers({'content-type': 'application/json'}),
      credentials: 'include',
      body: JSON.stringify({
        username,
        password  
      })
    });
    
    const response = await loginReq.json();
    if (response.username === username) {
      dispatch(credentials(response));
      dispatch(navigate('/admin'));
    }

  } catch (err) {
    console.error(err);
  }
}

export const credentials = (credentials) => {
  sessionStorage.setItem('credentials', JSON.stringify(credentials));
  return {
    type: UPDATE_CREDENTIALS,
    payload: {
      credentials
    }
  }
}
