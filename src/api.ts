/**
 * @file API
 * @desc These methods facilitate HTTP requests to the Venus API.
 */

import { request } from './util';
import {
  APIRequest,
  APIResponse,
  AccountServiceRequest,
  CTokenServiceRequest,
  MarketHistoryServiceRequest,
  GovernanceServiceRequest,
} from './types';

// import { version } from '../package.json';

// let userPlatform;

// try {
//   if (typeof document !== 'undefined') {
//     userPlatform = 'web';
//   } else if (
//     typeof navigator !== 'undefined' &&
//     navigator.product === 'ReactNative'
//   ) {
//     userPlatform = 'react-native';
//   } else if (
//     typeof navigator !== 'undefined' && 
//     navigator.userAgent.toLowerCase().indexOf('electron') > -1
//   ) {
//     userPlatform = 'electron-js';
//   } else {
//     userPlatform = 'node-js';
//   }
// } catch (e) {
//   userPlatform = 'unknown';
// }

/**
 * Makes a request to the AccountService API. The Account API retrieves
 *     information for various accounts which have interacted with the protocol.
 *     For more details, see the Venus API documentation.
 *
 * @param {object} options A JavaScript object of API request parameters.
 *
 * @returns {object} Returns the HTTP response body or error.
 *
 * @example
 *
 * ```
 * (async function() {
 *   const account = await Venus.api.account({
 *     "addresses": "0xB61C5971d9c0472befceFfbE662555B78284c307",
 *     "network": "bnbt"
 *   });
 * 
 *   let sxpBorrowBalance = 0;
 *   if (Object.isExtensible(account) && account.accounts) {
 *     account.accounts.forEach((acc) => {
 *       acc.tokens.forEach((tok) => {
 *         if (tok.symbol === Venus.vSXP) {
 *           sxpBorrowBalance = +tok.borrow_balance_underlying.value;
 *         }
 *       });
 *     });
 *   }
 * 
 *   console.log('sxpBorrowBalance', sxpBorrowBalance);
 * })().catch(console.error);
 * ```
 */
// TODO -- this will be updated when api is ready
export function account(options: AccountServiceRequest): Promise<APIResponse> {
  return queryApi(options, 'account', '/api/v2/account');
}

/**
 * Makes a request to the CTokenService API. The vToken API retrieves
 *     information about vToken contract interaction. For more details, see the 
 *     Venus API documentation.
 *
 * @param {object} options A JavaScript object of API request parameters.
 *
 * @returns {object} Returns the HTTP response body or error.
 *
 * @example
 *
 * ```
 * (async function() {
 *   const vSxpData = await Venus.api.vToken({
 *     "addresses": Venus.util.getAddress(Venus.vSXP)
 *   });
 * 
 *   console.log('vSxpData', vSxpData); // JavaScript Object
 * })().catch(console.error);
 * ```
 */
export function vToken(options: CTokenServiceRequest): Promise<APIResponse> {
  return queryApi(options, 'vToken', '/api/vtoken');
}

/**
 * Makes a request to the MarketHistoryService API. The market history service
 *     retrieves information about a market. For more details, see the Venus
 *     API documentation.
 *
 * @param {object} options A JavaScript object of API request parameters.
 *
 * @returns {object} Returns the HTTP response body or error.
 *
 * @example
 *
 * ```
 * (async function() {
 *   const vUsdcMarketData = await Venus.api.marketHistory({
 *     "asset": Venus.util.getAddress(Venus.vUSDC),
 *     "min_block_timestamp": 1559339900,
 *     "max_block_timestamp": 1598320674,
 *     "num_buckets": 10,
 *   });
 * 
 *   console.log('vUsdcMarketData', vUsdcMarketData); // JavaScript Object
 * })().catch(console.error);
 * ```
 */
export function marketHistory(options: MarketHistoryServiceRequest): Promise<APIResponse> {
  // return queryApi(options, 'Market History', '/api/v2/market_history/graph');
  return queryApi(options, 'Market History', '/api/market_history/graph');
}

/**
 * Makes a request to the GovernanceService API. The Governance Service includes
 *     three endpoints to retrieve information about COMP accounts. For more 
 *     details, see the Venus API documentation.
 *
 * @param {object} options A JavaScript object of API request parameters.
 * @param {string} endpoint A string of the name of the corresponding governance
 *     service endpoint. Valid values are `proposals`, `voteReceipts`, or
 *     `accounts`.
 *
 * @returns {object} Returns the HTTP response body or error.
 *
 * @example
 *
 * ```
 * (async function() {
 *   const proposal = await Venus.api.governance(
 *     { "proposal_ids": [ 20 ] }, 'proposals'
 *   );
 * 
 *   console.log('proposal', proposal); // JavaScript Object
 * })().catch(console.error);
 * ```
 */
export function governance(options: GovernanceServiceRequest, endpoint: string): Promise<APIResponse> {
  if (endpoint === 'proposals') {
    // endpoint = '/api/v2/governance/proposals';
    endpoint = '/api/governance/proposals';
  } else if (endpoint === 'voteReceipts') {
    // endpoint = '/api/v2/governance/proposal_vote_receipts';
    endpoint = '/api/governance/proposal_vote_receipts';
  } else {
    // endpoint = '/api/v2/governance/accounts';
    endpoint = '/api/governance/accounts';
  }

  return queryApi(options, 'GovernanceService', endpoint);
}

function queryApi(options: APIRequest, name: string, path: string): Promise<APIResponse> {
  return new Promise((resolve, reject) => {
    const errorPrefix = `Venus [api] [${name}] | `;
    let responseCode, responseMessage;

    // TODO -- api service endpoint should be updated.
    let hostname = 'https://api.venus.io';
    if (options && (options.network === 'bnbt')) hostname = 'https://testnetapi.venus.io';

    request({
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        // 'venus-js': `[${version}]_[${userPlatform}]`,
      },
      body: options
    }).then((response) => {
      responseCode = response.status;
      responseMessage = response.statusText;

      const responseBody = JSON.parse(response.body);

      if (responseCode >= 200 && responseCode <= 299) {
        resolve(responseBody);
      } else {
        throw 'Invalid request made to the Venus API.';
      }
    }).catch((error) => {
      let errorMessage = '';

      if (error.name === 'SyntaxError') {
        errorMessage = errorPrefix + `Unable to parse response body.`;
      } else {
        errorMessage = errorPrefix + error.toString();
      }

      reject({ error: errorMessage, responseCode, responseMessage });
    });
  });
}
