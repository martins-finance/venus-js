// Example of fetching prices from the Venus protocol's open price feed using Venus.js
const Venus = require('../../dist/nodejs/index.js');

//const provider = "https://apis.ankr.com/4806f8c50e3f4b02b3e39384c8f13231/9a48f92ab5ccfbed0b80327a9bbf6d8f/binance/full/main";
//const wallet = '0xeECc467a08b4070D8555e51042e9FC04878de2b9';

const provider = "https://data-seed-prebsc-1-s1.binance.org:8545/";

const liquidator_wallet = '0x7c35Bb0DC7536fF003e94C31D49371aCCfED7fA2';
const mnemonic = "subject novel custom setup nice hungry gentle present pear female riot virtual";
const liquidator_privateKey = '0x31f70beeac2895dd91b9e50caae41a87f6e4b471b279729c9f7a6041164935e9';

const borrower1_wallet = '0xC6c46D184beC04E59D37024cbEAf28a3635F8412';
const borrower2_wallet = '0xdF9Cc98212d8d0E7eB346441285281C1385eceAD';
const borrower3_wallet = '0x88DdD174a6C4bCE8eABF95Dc2bC56A953594eaCf';
const borrower4_wallet = '0x8BC3C73136165f16D7B2449cB01683e52edDA090';
const borrower5_wallet = '0x269B5ecC5078fbDa36d312f439df66b3874C2095';

const BNBAddress = '0x0000000000000000000000000000000000000000';
const vBNBAddress = '0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c';
const VAIAddress = '0x5fFbE5302BadED40941A403228E6AD03f93752d9';
const vXVSAddress = '0x6d6F697e34145Bb95c54E77482d97cc261Dc237E';
const vBUSDAddress = '0x08e0A5575De71037aE36AbfAfb516595fE68e5e4';
const vLTCAddress = '0xafc13bc065abee838540823431055d2ea52eba52';
const venus = new Venus(provider,
  { privateKey: liquidator_privateKey });
(async function () {

  // console.log('')
  // console.log('--- INITIAL REPORT ---')
  // console.log('liquidator_wallet balance', await Venus.venus.getVenusBalance(liquidator_wallet, provider));
  // console.log('borrower_wallet balance', await Venus.venus.getVenusBalance(borrower3_wallet, provider));
  // console.log('borrower_wallet mintedVAIs', await venus.mintedVAIs(borrower4_wallet));
  
  // console.log('liquidator_wallet checkMembership vBNB response', await venus.checkMembership(liquidator_wallet, vBNBAddress));
  // console.log('liquidator_wallet assetsIn', await venus.getAssetsIn(liquidator_wallet));
  // console.log('liquidator_wallet balance', await Venus.eth.getBalance(liquidator_wallet, provider));
  // console.log('')
  // console.log('borrower_wallet checkMembership vBNB response', await venus.checkMembership(borrower4_wallet, vBNBAddress));
  // console.log('borrower_wallet assetsIn', await venus.getAssetsIn(liquidator_wallet));
  // console.log('borrower_wallet balance', await Venus.eth.getBalance(borrower4_wallet, provider));
  // console.log('------')
  // console.log('')

  let response = await venus.getHypotheticalAccountLiquidity(borrower1_wallet, BNBAddress, 0, 0);
  console.log('borrower1_wallet getHypotheticalAccountLiquidity response', response);

  response = await venus.getHypotheticalAccountLiquidity(borrower2_wallet, BNBAddress, 0, 0);
  console.log('borrower2_wallet getHypotheticalAccountLiquidity response', response);

  response = await venus.getHypotheticalAccountLiquidity(borrower3_wallet, vBNBAddress, 0, 0);
  console.log('borrower3_wallet getHypotheticalAccountLiquidity response', response);

  response = await venus.getHypotheticalAccountLiquidity(borrower4_wallet, BNBAddress, 0, 0);
  console.log('borrower4_wallet getHypotheticalAccountLiquidity response', response);

  response = await venus.getAccountLiquidity(borrower5_wallet);
  console.log('borrower5_wallet getAccountLiquidity response', response);

  const trxOptions = { gasLimit: 2500000, mantissa: true };
  
  // response = await venus.approve("BUSD", liquidator_wallet, "fffffffffffffffffffffffffffffff", trxOptions);
  // console.log('liquidator_wallet aprove BUSD', await response.wait());

  //const trx = await venus.liquidateBorrow("BNB", borrower4_wallet, '50000000000000000', vXVSAddress, trxOptions);
  //console.log('liquidateBorrow response', trx);

  let xvsBalance = await venus.borrowBalanceCurrent("BUSD", borrower5_wallet);
  console.log('borrowBalanceCurrent BUSD', xvsBalance);
  const repayAmount = xvsBalance.div(3);
  console.log('repayAmount BUSD', repayAmount);

  //response = await venus.approve("LTC", liquidator_wallet, xvsBalance, trxOptions);
  //console.log('liquidator_wallet aprove LTC', await response.wait());
  
  // response = await venus.approve("BUSD", vBUSDAddress, xvsBalance, trxOptions);
  // console.log('liquidator_wallet aprove BUSD', await response.wait());
  
  // const trx = await venus.liquidateBorrow("BUSD", borrower5_wallet, repayAmount, vLTCAddress, trxOptions);
  // console.log('liquidateBorrow response', await trx.wait());
 
  xvsBalance = await venus.borrowBalanceCurrent("XVS", liquidator_wallet);
  console.log('liquidator_wallet borrowBalanceCurrent XVS', xvsBalance);
 

   xvsBalance = await venus.borrowBalanceCurrent("BNB", borrower3_wallet);
   console.log('borrowBalanceCurrent XVS', xvsBalance);
  // const repayAmount = xvsBalance.div(3);
  // console.log('repayAmount XVS', repayAmount);
  
  // response = await venus.approve("XVS", liquidator_wallet, xvsBalance, trxOptions);
  // console.log('liquidator_wallet aprove XVS', await response.wait());
  
  // response = await venus.approve("XVS", borrower3_wallet, xvsBalance, trxOptions);
  // console.log('borrower3_wallet aprove XVS', await response.wait());

  // response = await venus.approve("BUSD", borrower3_wallet, xvsBalance, trxOptions);
  // console.log('borrower3_wallet aprove BUSD', await response.wait());


 
  // const trx = await venus.liquidateBorrow("XVS", borrower3_wallet, repayAmount, vBUSDAddress, trxOptions);
  // console.log('liquidateBorrow response', await trx.wait());


  // console.log('')
  // console.log('--- END REPORT ---')
  // console.log('liquidator_wallet balance', await Venus.venus.getVenusBalance(liquidator_wallet, provider));
  // console.log('borrower_wallet balance', await Venus.venus.getVenusBalance(borrower_wallet, provider));
  // console.log('borrower_wallet mintedVAIs', await venus.mintedVAIs(borrower_wallet));

  // console.log('liquidator_wallet checkMembership vBNB response', await venus.checkMembership(liquidator_wallet, vBNBAddress));
  // console.log('liquidator_wallet assetsIn', await venus.getAssetsIn(liquidator_wallet));
  // console.log('liquidator_wallet balance', await Venus.eth.getBalance(liquidator_wallet, provider));
  // console.log('')
  // console.log('borrower_wallet checkMembership vBNB response', await venus.checkMembership(borrower_wallet, vBNBAddress));
  // console.log('borrower_wallet assetsIn', await venus.getAssetsIn(liquidator_wallet));
  // console.log('borrower_wallet balance', await Venus.eth.getBalance(borrower_wallet, provider));
  // console.log('------')

})().catch(console.error);