/**
 * @file vToken
 * @desc These methods facilitate interactions with the vToken smart
 *     contracts.
 */

 import { ethers } from 'ethers';
 import * as eth from './eth';
 import { netId } from './helpers';
 import {
   constants, address, abi, decimals, underlyings, cTokens
 } from './constants';
 import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
 import { CallOptions, TrxResponse } from './types';
 import { toChecksumAddress, getDecimals } from './util';
 
 /**
  * Supplies the user's Binance Smart Chain asset to the Venus Protocol.
  *
  * @param {string} asset A string of the asset to supply.
  * @param {number | string | BigNumber} amount A string, number, or BigNumber
  *     object of the amount of an asset to supply. Use the `mantissa` boolean in
  *     the `options` parameter to indicate if this value is scaled up (so there 
  *     are no decimals) or in its natural scale.
  * @param {boolean} noApprove Explicitly prevent this method from attempting an 
  *     BEP-20 `approve` transaction prior to sending the `mint` transaction.
  * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
  *     transaction. A passed `gasLimit` will be used in both the `approve` (if 
  *     not supressed) and `mint` transactions.
  *
  * @returns {object} Returns an Ethers.js transaction object of the supply
  *     transaction.
  *
  * @example
  *
  * ```
  * const venus = new Venus(window.ethereum);
  *
  * // Ethers.js overrides are an optional 3rd parameter for `supply`
  * // const trxOptions = { gasLimit: 250000, mantissa: false };
  * 
  * (async function() {
  * 
  *   console.log('Supplying SXP to the Venus Protocol...');
  *   const trx = await venus.supply(Venus.SXP, 1);
  *   console.log('Ethers.js transaction object', trx);
  * 
  * })().catch(console.error);
  * ```
  */
export async function supply(
   asset: string,
   amount: string | number | BigNumber,
   noApprove = false,
   options: CallOptions = {}
 ) : Promise<TrxResponse> {
   await netId(this);
   const errorPrefix = 'Venus [supply] | ';
 
   const vTokenName = 'v' + asset;
   const vTokenAddress = address[this._network.name][vTokenName];
 
   if (!vTokenAddress || !underlyings.includes(asset)) {
     throw Error(errorPrefix + 'Argument `asset` cannot be supplied.');
   }
 
   if (
     typeof amount !== 'number' &&
     typeof amount !== 'string' &&
     !ethers.BigNumber.isBigNumber(amount)
   ) {
     throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
   }
 
   if (!options.mantissa) {
     amount = +amount;
     amount = amount * Math.pow(10, decimals[asset]);
   }
 
   amount = ethers.BigNumber.from(amount.toString());
 
   // if (vTokenName === constants.cETH) {
   //   options.abi = abi.cEther;
   // } else {
   //   options.abi = abi.cErc20;
   // }
   if (vTokenName === constants.vBNB) {
     options.abi = abi.vBNB;
   } else {
     options.abi = abi.vBep20;
   }
 
   options._compoundProvider = this._provider;
 
   if (vTokenName !== constants.vBNB && noApprove !== true) {
     const underlyingAddress = address[this._network.name][asset];
     const userAddress = this._provider.address;
 
     // Check allowance
     const allowance = await eth.read(
       underlyingAddress,
       'allowance',
       [ userAddress, vTokenAddress ],
       options
     );
 
     const notEnough = allowance.lt(amount);
 
     if (notEnough) {
       // ERC-20 approve transaction
       await eth.trx(
         underlyingAddress,
         'approve',
         [ vTokenAddress, amount ],
         options
       );
     }
   }
 
   const parameters = [];
   if (vTokenName === constants.vBNB) {
     options.value = amount;
   } else {
     parameters.push(amount);
   }
 
   return eth.trx(vTokenAddress, 'mint', parameters, options);
}
 
 /**
  * Redeems the user's Binance Smart Chain asset from the Venus Protocol.
  *
  * @param {string} asset A string of the asset to redeem, or its vToken name.
  * @param {number | string | BigNumber} amount A string, number, or BigNumber
  *     object of the amount of an asset to redeem. Use the `mantissa` boolean in
  *     the `options` parameter to indicate if this value is scaled up (so there 
  *     are no decimals) or in its natural scale. This can be an amount of 
  *     vTokens or underlying asset (use the `asset` parameter to specify).
  * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
  *     transaction.
  *
  * @returns {object} Returns an Ethers.js transaction object of the redeem
  *     transaction.
  *
  * @example
  *
  * ```
  * const venus = new Venus(window.ethereum);
  * 
  * (async function() {
  * 
  *   console.log('Redeeming SXP...');
  *   const trx = await venus.redeem(Venus.SXP, 1); // also accepts vToken args
  *   console.log('Ethers.js transaction object', trx);
  * 
  * })().catch(console.error);
  * ```
  */
export async function redeem(
   asset: string,
   amount: string | number | BigNumber,
   options: CallOptions = {}
 ): Promise<TrxResponse> {
   await netId(this);
   const errorPrefix = 'Venus [redeem] | ';
 
   if (typeof asset !== 'string' || asset.length < 1) {
     throw Error(errorPrefix + 'Argument `asset` must be a non-empty string.');
   }
 
   const assetIsVToken = asset[0] === 'v';
 
   const vTokenName = assetIsVToken ? asset : 'v' + asset;
   const vTokenAddress = address[this._network.name][vTokenName];
 
   const underlyingName = assetIsVToken ? asset.slice(1, asset.length) : asset;
 
   if (!cTokens.includes(vTokenName) || !underlyings.includes(underlyingName)) {
     throw Error(errorPrefix + 'Argument `asset` is not supported.');
   }
 
   if (
     typeof amount !== 'number' &&
     typeof amount !== 'string' &&
     !ethers.BigNumber.isBigNumber(amount)
   ) {
     throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
   }
 
   if (!options.mantissa) {
     amount = +amount;
     amount = amount * Math.pow(10, decimals[asset]);
   }
 
   amount = ethers.BigNumber.from(amount.toString());
 
   const trxOptions: CallOptions = {
     ...options,
     _compoundProvider: this._provider,
     abi: vTokenName === constants.vBNB ? abi.vBNB : abi.vBep20,
   };
   const parameters = [ amount ];
   const method = assetIsVToken ? 'redeem' : 'redeemUnderlying';
 
   return eth.trx(vTokenAddress, method, parameters, trxOptions);
}
 
 /**
  * Borrows an Binance Smart Chain asset from the Venus Protocol for the user.
  *     The user's address must first have supplied collateral and entered a 
  *     corresponding market.
  *
  * @param {string} asset A string of the asset to borrow (must be a supported 
  *     underlying asset).
  * @param {number | string | BigNumber} amount A string, number, or BigNumber
  *     object of the amount of an asset to borrow. Use the `mantissa` boolean in
  *     the `options` parameter to indicate if this value is scaled up (so there 
  *     are no decimals) or in its natural scale.
  * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
  *     transaction.
  *
  * @returns {object} Returns an Ethers.js transaction object of the borrow
  *     transaction.
  *
  * @example
  *
  * ```
  * const venus = new Venus(window.ethereum);
  * 
  * (async function() {
  * 
  *   const sxpScaledUp = '32000000000000000000';
  *   const trxOptions = { mantissa: true };
  * 
  *   console.log('Borrowing 32 SXP...');
  *   const trx = await venus.borrow(Venus.SXP, sxpScaledUp, trxOptions);
  * 
  *   console.log('Ethers.js transaction object', trx);
  * 
  * })().catch(console.error);
  * ```
  */
export async function borrow(
   asset: string,
   amount: string | number | BigNumber,
   options: CallOptions = {}
 ) : Promise<TrxResponse> {
   await netId(this);
   const errorPrefix = 'Venus [borrow] | ';
 
   const vTokenName = 'v' + asset;
   const vTokenAddress = address[this._network.name][vTokenName];
 
   if (!vTokenAddress || !underlyings.includes(asset)) {
     throw Error(errorPrefix + 'Argument `asset` cannot be borrowed.');
   }
 
   if (
     typeof amount !== 'number' &&
     typeof amount !== 'string' &&
     !ethers.BigNumber.isBigNumber(amount)
   ) {
     throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
   }
 
   if (!options.mantissa) {
     amount = +amount;
     amount = amount * Math.pow(10, decimals[asset]);
   }
 
   amount = ethers.BigNumber.from(amount.toString());
 
   const trxOptions: CallOptions = {
     ...options,
     _compoundProvider: this._provider,
   };
   const parameters = [ amount ];
   trxOptions.abi = vTokenName === constants.vBNB ? abi.vBNB : abi.vBep20;
 
   return eth.trx(vTokenAddress, 'borrow', parameters, trxOptions);
}
 
 /**
  * Repays a borrowed Binance Smart Chain asset for the user or on behalf of 
  *     another Binance Smart Chain address.
  *
  * @param {string} asset A string of the asset that was borrowed (must be a 
  *     supported underlying asset).
  * @param {number | string | BigNumber} amount A string, number, or BigNumber
  *     object of the amount of an asset to borrow. Use the `mantissa` boolean in
  *     the `options` parameter to indicate if this value is scaled up (so there 
  *     are no decimals) or in its natural scale.
  * @param {string | null} [borrower] The Binance Smart Chain address of the borrower 
  *     to repay an open borrow for. Set this to `null` if the user is repaying
  *     their own borrow.
  * @param {boolean} noApprove Explicitly prevent this method from attempting an 
  *     ERC-20 `approve` transaction prior to sending the subsequent repayment 
  *     transaction.
  * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
  *     transaction. A passed `gasLimit` will be used in both the `approve` (if 
  *     not supressed) and `repayBorrow` or `repayBorrowBehalf` transactions.
  *
  * @returns {object} Returns an Ethers.js transaction object of the repayBorrow
  *     or repayBorrowBehalf transaction.
  *
  * @example
  *
  * ```
  * const venus = new Venus(window.ethereum);
  * 
  * (async function() {
  * 
  *   console.log('Repaying SXP borrow...');
  *   const address = null; // set this to any address to repayBorrowBehalf
  *   const trx = await venus.repayBorrow(Venus.SXP, 32, address);
  * 
  *   console.log('Ethers.js transaction object', trx);
  * 
  * })().catch(console.error);
  * ```
  */
export async function repayBorrow(
   asset: string,
   amount: string | number | BigNumber,
   borrower: string,
   noApprove = false,
   options: CallOptions = {}
 ) : Promise<TrxResponse> {
   await netId(this);
   const errorPrefix = 'Venus [repayBorrow] | ';
 
   const vTokenName = 'v' + asset;
   const vTokenAddress = address[this._network.name][vTokenName];
 
   if (!vTokenAddress || !underlyings.includes(asset)) {
     throw Error(errorPrefix + 'Argument `asset` is not supported.');
   }
 
   if (
     typeof amount !== 'number' &&
     typeof amount !== 'string' &&
     !ethers.BigNumber.isBigNumber(amount)
   ) {
     throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
   }
 
   const method = ethers.utils.isAddress(borrower) ? 'repayBorrowBehalf' : 'repayBorrow';
   if (borrower && method === 'repayBorrow') {
     throw Error(errorPrefix + 'Invalid `borrower` address.');
   }
 
   if (!options.mantissa) {
     amount = +amount;
     amount = amount * Math.pow(10, decimals[asset]);
   }
 
   amount = ethers.BigNumber.from(amount.toString());
 
   const trxOptions: CallOptions = {
     ...options,
     _compoundProvider: this._provider,
   };
 
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const parameters: any[] = method === 'repayBorrowBehalf' ? [ borrower ] : [];
   if (vTokenName === constants.vBNB) {
     trxOptions.value = amount;
     trxOptions.abi = abi.vBNB;
   } else {
     parameters.push(amount);
     trxOptions.abi = abi.vBep20;
   }
 
   if (vTokenName !== constants.vBNB && noApprove !== true) {
     const underlyingAddress = address[this._network.name][asset];
     const userAddress = this._provider.address;
 
     // Check allowance
     const allowance = await eth.read(
       underlyingAddress,
       'allowance',
       [ userAddress, vTokenAddress ],
       trxOptions
     );
 
     const notEnough = allowance.lt(amount);
 
     if (notEnough) {
       // ERC-20 approve transaction
       await eth.trx(
         underlyingAddress,
         'approve',
         [ vTokenAddress, amount ],
         trxOptions
       );
     }
   }
 
   return eth.trx(vTokenAddress, method, parameters, trxOptions);
}
 
export async function liquidateBorrow(
   asset: string,
   borrower: string,
   repayAmount: string | number | BigNumber,
   seizevToken: string,
   options: CallOptions = {}
 ) : Promise<TrxResponse> {
   await netId(this);
   const errorPrefix = 'Venus [liquidateBorrow] | ';
 
   const vTokenName = 'v' + asset;
   const vTokenAddress = address[this._network.name][vTokenName];
 
   if (!vTokenAddress || !underlyings.includes(asset)) {
     throw Error(errorPrefix + 'Argument `asset` is not supported.');
   }
 
   if (typeof borrower !== 'string') {
     throw Error(errorPrefix + 'Argument `borrower` must be a string.');
   }
 
   try {
     borrower = toChecksumAddress(borrower);
   } catch(e) {
     throw Error(errorPrefix + 'Argument `borrower` must be a valid Ethereum address.');
   }
 
   if (
     typeof repayAmount !== 'number' &&
     typeof repayAmount !== 'string' &&
     !ethers.BigNumber.isBigNumber(repayAmount)
   ) {
     throw Error(errorPrefix + 'Argument `repayAmount` must be a string, number, or BigNumber.');
   }
 
   if (!options.mantissa) {
     repayAmount = +repayAmount;
     repayAmount = repayAmount * Math.pow(10, decimals[asset]);
   }
   repayAmount = ethers.BigNumber.from(repayAmount);
 
   const trxOptions: CallOptions = {
     ...options,
     _compoundProvider: this._provider,
   };
 
   // eslint-disable-next-line  @typescript-eslint/no-explicit-any
   const parameters:any = [ borrower ]; 
   if (vTokenName === constants.vBNB) {
     trxOptions.value = repayAmount;
     trxOptions.abi = abi.vBNB;
   } else {
     parameters.push(repayAmount);
     trxOptions.abi = abi.vBep20;
   }
   parameters.push(seizevToken);
 
   return eth.trx(vTokenAddress, 'liquidateBorrow', parameters, trxOptions);
}
 
export async function approve(
   asset: string,
   spender: string,
   amount: string | number | BigNumber,
   options: CallOptions = {}
 ) : Promise<TrxResponse> {
   await netId(this);
   const errorPrefix = 'Venus [approve] | ';
 
   const vTokenName = asset;
   const vTokenAddress = address[this._network.name][vTokenName];
 
   if (!vTokenAddress || !underlyings.includes(asset)) {
     throw Error(errorPrefix + 'Argument `asset` is not supported.');
   }
 
   if (typeof spender !== 'string') {
     throw Error(errorPrefix + 'Argument `spender` must be a string.');
   }
 
   try {
     spender = toChecksumAddress(spender);
   } catch(e) {
     throw Error(errorPrefix + 'Argument `spender` must be a valid address.');
   }
 
   if (
     typeof amount !== 'number' &&
     typeof amount !== 'string' &&
     !ethers.BigNumber.isBigNumber(amount)
   ) {
     throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
   }
 
   const trxOptions: CallOptions = {
     ...options,
     _compoundProvider: this._provider,
   };
 
   const parameters = [ spender, amount ];
   
     trxOptions.abi = abi.Bep20;
 
   return eth.trx(vTokenAddress, 'approve', parameters, trxOptions);
}
 
export async function balanceOf(
  assetName: string,
  account: string,
  options: CallOptions = {}
) : Promise<string> {
  const errorPrefix = 'Venus [balanceOf] | ';

  const tokenAddress = address[this._network.name][assetName];
  if (!tokenAddress) {
    throw Error(`${errorPrefix} Argument asset: ${assetName} is not supported.`);
  }

  if (typeof account !== 'string') {
    throw Error(errorPrefix + 'Argument `account` must be a string.');
  }

  try {
    account = toChecksumAddress(account);
  } catch(e) {
    throw Error(errorPrefix + 'Argument `account` must be a valid Ethereum address.');
  }

  const parameters = [ account ];

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.vBep20,
    ...options
  };
  
  const balance = await eth.read(tokenAddress, 'balanceOf', parameters, trxOptions);
  return ethers.utils.formatUnits(balance, getDecimals(assetName));
} 

export async function borrowBalanceCurrent(
  assetName: string,
  account: string,
  options: CallOptions = {}
) : Promise<string> {
  const errorPrefix = 'Venus [borrowBalanceCurrent] | ';

  const tokenAddress = address[this._network.name][assetName];
  if (!tokenAddress) {
    throw Error(`${errorPrefix} Argument asset: ${assetName} is not supported.`);
  }

  if (typeof account !== 'string') {
    throw Error(errorPrefix + 'Argument `borrower` must be a string.');
  }

  try {
    account = toChecksumAddress(account);
  } catch(e) {
    throw Error(errorPrefix + 'Argument `borrower` must be a valid Ethereum address.');
  }

  const parameters = [ account ];

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    ...options
  };

  if (assetName === constants.vBNB) {
    trxOptions.abi = abi.vBNB;
  } else {
    trxOptions.abi = abi.vBep20;
  }
  const balance = await eth.read(tokenAddress, 'borrowBalanceCurrent', parameters, trxOptions);
  return ethers.utils.formatUnits(balance, getDecimals(assetName));
}