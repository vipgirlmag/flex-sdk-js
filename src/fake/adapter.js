import _ from 'lodash';
import createTokenStore from './token_store';
import * as auth from './auth';
import * as api from './api';

/**
   This file implements a fake adapters for testing purposes only.

   The test responses are copy-pasted from real API responses.
 */

const adapterHelper =
  adapterDef =>
    config =>
      new Promise((resolve, reject) => {
        const rejectWithError = (response) => {
          const error = new Error(`Request failed with status code ${response.status}`);
          error.response = response;

          reject(error);
        };

        adapterDef.call(null, config, resolve, rejectWithError);
      });

const parseAuthorizationHeader = (value) => {
  if (!_.isString(value)) {
    return {};
  }

  const splitted = value.split(' ');

  return {
    tokenType: splitted[0],
    accessToken: splitted[1],
  };
};

const requireAuth = (config, reject, tokenStore) => {
  const { accessToken, tokenType } = parseAuthorizationHeader(config.headers.Authorization);

  if (!accessToken && !tokenType) {
    return reject({
      status: 401,
      data: '{}', // FIXME This is not what the server sends

      __additionalTestInfo: 'Authorization header missing',
    });
  }

  const validToken = tokenStore.validToken(accessToken, tokenType);

  if (validToken) {
    return Promise.resolve();
  }

  return reject({
    status: 401,
    data: '{}', // FIXME This is not what the server sends
  });
};

const router = (config, resolve, reject, tokenStore) => {
  switch (config.url) {
    case '/v1/api/users/show':
      return requireAuth(config, reject, tokenStore)
        .then(() => api.users.show(config, resolve));
    case '/v1/api/marketplace/show':
      return requireAuth(config, reject, tokenStore)
        .then(() => api.marketplace.show(config, resolve));
    case '/v1/api/listings/search':
      return requireAuth(config, reject, tokenStore)
        .then(() => api.listings.search(config, resolve));
    case '/v1/api/listings/create':
      return requireAuth(config, reject, tokenStore)
        .then(() => api.listings.create(config, resolve, reject));
    case '/v1/auth/token':
      return auth.token(config, resolve, reject, tokenStore);
    case '/v1/auth/revoke':
      return requireAuth(config, reject, tokenStore)
        .then(() => auth.revoke(config, resolve, reject, tokenStore));
    default:
      throw new Error(`Not implemented to Fake adapter: ${config.url}`);
  }
};

/**
   Create a fake adapter instance.

   Features:

   - Handle requests
   - Store all requests (so that they can be inspected in tests)
   - Implement fake token store
*/
const createAdapter = () => {
  const requests = [];
  const tokenStore = createTokenStore();

  return {
    requests,
    tokenStore,
    adapterFn: adapterHelper((config, resolve, reject) => {
      // Store each request to `requests` array
      requests.push(config);

      // Call router to handle the request
      return router(config, resolve, reject, tokenStore);
    }),
  };
};

export default createAdapter;