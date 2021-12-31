/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

import { createStore, compose, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";

import app from "./reducers/app.js";
import shop from "./reducers/shop.js";

/**
  This is a JavaScript mixin that you can use to connect a Custom Element base
  class to a Redux store. The `stateChanged(state)` method will be called when
  the state is updated.

  Example:

      import { connect } from 'pwa-helpers/connect-mixin.js';

      class MyElement extends connect(store)(HTMLElement) {
        stateChanged(state) {
          this.textContent = state.data.count.toString();
        }
      }
*/
export const connect = (store) => (baseElement) =>
  class extends baseElement {
    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }
      this._storeUnsubscribe = store.subscribe(() =>
        this.stateChanged(store.getState())
      );
      this.stateChanged(store.getState());
    }
    disconnectedCallback() {
      this._storeUnsubscribe();
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }
    /**
     * The `stateChanged(state)` method will be called when the state is updated.
     */
    stateChanged(_state) {}
  };

/**
  A Redux store enhancer that lets you lazy-install reducers after the store
  has booted up. Use this if your application lazy-loads routes that are connected
  to a Redux store.

  Example:

      import { combineReducers } from 'redux';
      import { lazyReducerEnhancer } from 'pwa-helpers/lazy-reducer-enhancer.js';
      import someReducer from './reducers/someReducer.js';

      export const store = createStore(
        (state, action) => state,
        compose(lazyReducerEnhancer(combineReducers))
      );

  Then, in your page/element, you can lazy load a specific reducer with:

      store.addReducers({
        someReducer
      });
*/
export const lazyReducerEnhancer = (combineReducers) => {
  const enhancer = (nextCreator) => {
    return (origReducer, preloadedState) => {
      let lazyReducers = {};
      const nextStore = nextCreator(origReducer, preloadedState);
      return Object.assign({}, nextStore, {
        addReducers(newReducers) {
          const combinedReducerMap = Object.assign({}, lazyReducers, newReducers);
          this.replaceReducer(combineReducers((lazyReducers = combinedReducerMap)));
        },
      });
    };
  };
  return enhancer;
};

// Sets up a Chrome extension for time travel debugging.
// See https://github.com/zalmoxisus/redux-devtools-extension for more information.
const devCompose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Initializes the Redux store with a lazyReducerEnhancer (so that you can
// lazily add reducers after the store has been created) and redux-thunk (so
// that you can dispatch async actions). See the "Redux and state management"
// section of the wiki for more details:
// https://github.com/Polymer/pwa-starter-kit/wiki/4.-Redux-and-state-management
export const store = createStore(
  (state) => state,
  devCompose(lazyReducerEnhancer(combineReducers), applyMiddleware(thunk))
);

// Initially loaded reducers.
store.addReducers({
  app,
  shop,
});
