import {
  REQUEST_CONFIG, RECEIVE_CONFIG,
  REQUEST_SAVE_CONFIG, RECEIVE_SAVE_CONFIG, RECEIVE_SAVE_CONFIG_FAIL
} from '../actions/config';
import {
  RECEIVE_LOGOUT
} from '../actions/authentication';
import {
  REQUEST_START, RECEIVE_START, RECEIVE_START_FAIL,
  REQUEST_SYNCHRONIZE, RECEIVE_SYNCHRONIZE, RECEIVE_SYNCHRONIZE_FAIL
} from '../actions/application';


export function application (state = {
  isInitialized: false,
  isFetching: false,
  config: {},
  synchronize: {}
}, action) {

  let config;
  switch (action.type) {
    case REQUEST_START:
      return Object.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_START:
      config = action.payload.config;
      config.site = config.site || {};
      config.site.url = config.urls.site;

      return Object.assign({}, state, {
        isFetching: false,
        isInitialized: true,
        config: config,
        theme: action.payload.theme,
      });
    case REQUEST_SYNCHRONIZE:
      return Object.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_SYNCHRONIZE:
      return Object.assign({}, state, {
        isFetching: false,
        synchronize: {
          time: new Date()
        }
      });
    case RECEIVE_SYNCHRONIZE_FAIL:
      return Object.assign({}, state, {
        isFetching: false
      });
    case REQUEST_SAVE_CONFIG:
      return Object.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_SAVE_CONFIG:
      config = action.payload.config;
      config.site = config.site || {};
      config.site.url = config.urls.site;

      return Object.assign({}, state, {
        isFetching: false,
        config: config,
        theme: action.payload.theme,
      });
    case RECEIVE_SAVE_CONFIG_FAIL:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case RECEIVE_LOGOUT:
      return Object.assign({}, state, {
        isFetching: false,
        synchronize: {}
      });
    default:
      return state;
  }
}
