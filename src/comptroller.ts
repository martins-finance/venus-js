/**
 * @file Comptroller
 * @desc These methods facilitate interactions with the Comptroller smart
 *     contract.
 */
import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { address, abi, cTokens } from './constants';
import { CallOptions, TrxResponse } from './types';
import { toChecksumAddress, getAssetNameByAddress } from './util';

/**
 * Enters the user's address into Venus Protocol markets.
 *
 * @param {any[]} markets An array of strings of markets to enter, meaning use
 *     those supplied assets as collateral.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if 
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the enterMarkets
 *     transaction.
 *
 * @example
 *
 * ```
 * const venus = new Venus(window.ethereum);
 * 
 * (async function () {
 *   const trx = await venus.enterMarkets(Venus.SXP); // Use [] for multiple
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function enterMarkets(
  markets: string | string[] = [],
  options: CallOptions = {}
) : Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Venus [enterMarkets] | ';

  if (typeof markets === 'string') {
    markets = [ markets ];
  }

  if (!Array.isArray(markets)) {
    throw Error(errorPrefix + 'Argument `markets` must be an array or string.');
  }

  const addresses = [];
  for (let i = 0; i < markets.length; i++) {
    if (markets[i][0] !== 'v') {
      markets[i] = 'v' + markets[i];
    }

    if (!cTokens.includes(markets[i])) {
      throw Error(errorPrefix + 'Provided market `' + markets[i] + '` is not a recognized vToken.');
    }

    addresses.push(address[this._network.name][markets[i]]);
  }
  const comptrollerAddress = address[this._network.name].Comptroller;
  const parameters = [ addresses ];

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comptroller,
    ...options
  };

  return eth.trx(comptrollerAddress, 'enterMarkets', parameters, trxOptions);
}

/**
 * Exits the user's address from a Venus Protocol market.
 *
 * @param {string} market A string of the symbol of the market to exit.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if 
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the exitMarket
 *     transaction.
 *
 * @example
 *
 * ```
 * const venus = new Venus(window.ethereum);
 * 
 * (async function () {
 *   const trx = await venus.exitMarket(Venus.SXP);
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function exitMarket(
  market: string,
  options: CallOptions = {}
) : Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Venus [exitMarkets] | ';

  if (typeof market !== 'string' || market === '') {
    throw Error(errorPrefix + 'Argument `market` must be a string of a cToken market name.');
  }

  if (market[0] !== 'v') {
    market = 'v' + market;
  }

  if (!cTokens.includes(market)) {
    throw Error(errorPrefix + 'Provided market `' + market + '` is not a recognized cToken.');
  }

  const cTokenAddress = address[this._network.name][market];

  const comptrollerAddress = address[this._network.name].Comptroller;
  const parameters = [ cTokenAddress ];

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comptroller,
    ...options
  };

  return eth.trx(comptrollerAddress, 'exitMarket', parameters, trxOptions);
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export async function getAssetsIn(account: string) : Promise<Array<any>> {
  await netId(this);
  const errorPrefix = 'Venus [getAssetsIn] | ';

  if (typeof account !== 'string') {
    throw Error(errorPrefix + 'Argument `account` must be a string.');
  }

  try {
    account = toChecksumAddress(account);
  } catch(e) {
    throw Error(errorPrefix + 'Argument `account` must be a valid Ethereum address.');
  }
  const comptrollerAddress = address[this._network.name].Comptroller;
  const parameters = [ account ];

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comptroller
  };

  const assetsIn = await eth.read(comptrollerAddress, 'getAssetsIn', parameters, trxOptions);
  const assets = []
  for (const address of assetsIn) {
    assets.push({ name: getAssetNameByAddress(address, this._network.name), address: address });
  }
  return assets;
}


export async function checkMembership(
  account: string,
  token_address: string
) : Promise<TrxResponse> {
  await netId(this);
  //const errorPrefix = 'Venus [checkMembership] | ';

  const comptrollerAddress = address[this._network.name].Comptroller;
  const parameters = [ account, token_address ];

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comptroller
  };

  return await eth.read(comptrollerAddress, 'checkMembership', parameters, trxOptions);
}


export async function liquidateBorrowAllowed(
  vTokenBorrowed: string,
  vTokenCollateral: string,
  liquidator: string,
  borrower: string,
  repayAmount: number,
  options: CallOptions = {}
) : Promise<TrxResponse> {
  await netId(this);
  //const errorPrefix = 'Venus [liquidateBorrowAllowed] | ';

  const comptrollerAddress = address[this._network.name].Comptroller;
  const parameters = [ vTokenBorrowed, vTokenCollateral, liquidator, borrower, repayAmount ];

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comptroller,
    ...options
  };

  return await eth.read(comptrollerAddress, 'liquidateBorrowAllowed', parameters, trxOptions);
}


export async function getAccountLiquidity(
  account: string,
  options: CallOptions = {}
) : Promise<string> {
  await netId(this);

  const comptrollerAddress = address[this._network.name].Comptroller;
  const parameters = [ account ];

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comptroller,
    ...options
  };

  const response = await eth.read(comptrollerAddress, 'getAccountLiquidity', parameters, trxOptions);

  const [error, liquidity, shortfall] = response;
  if (!ethers.BigNumber.from(error).isZero()) {
    throw new Error(`Error on network call. CODE: {error}`);
  }
  const liquidityBalance = ethers.BigNumber.from(liquidity).sub(
    ethers.BigNumber.from(shortfall)
  );
  return  ethers.utils.formatEther(liquidityBalance);

}

export async function closeFactor() : Promise<string> {
  await netId(this);

  const comptrollerAddress = address[this._network.name].Comptroller;

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comptroller
  };

  const closeFactorMantissa = await eth.read(comptrollerAddress, 'closeFactorMantissa', [],  trxOptions);
  return ethers.utils.formatEther(closeFactorMantissa);
}

export async function liquidationIncentive() : Promise<string> {
  await netId(this);

  const comptrollerAddress = address[this._network.name].Comptroller;

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comptroller
  };

  const liquidationIncentiveMantissa = await eth.read(comptrollerAddress, 'liquidationIncentiveMantissa', [],  trxOptions);
  return ethers.utils.formatEther(liquidationIncentiveMantissa);
}