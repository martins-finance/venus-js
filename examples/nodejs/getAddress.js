// Example of fetching a Venus protocol contract address with Venus.js
const Venus = require('../../dist/nodejs/index.js');

const sxpAddress = Venus.util.getAddress(Venus.XVS);
const vBNBAddressTestnet = Venus.util.getAddress(Venus.vBNB, 'mainnet');

console.log('SXP (mainnet)', sxpAddress);
console.log('vBNB (testnet)', vBNBAddressTestnet);
