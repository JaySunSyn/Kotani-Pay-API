const {
  getUserId, getUserDetails, getTargetCountry, number_format, processApiWithdraw, setProcessedTransaction, getExchangeRate,
} = require('../../../../modules/libraries');
const express = require('express');
const cors = require('cors');
const bearerToken = require('express-bearer-token');

const api_v2 = express().use(cors({ origin: true }), bearerToken());
const moment = require('moment');
const lib = require('./modules/libraries');
const { isValidPhoneNumber, validateMSISDN } = require('./modules/utilities');
const { getLatestBlock, validateWithdrawHash } = require('./modules/celokit');
const jenga = require('./modules/jengakit');
const { USD_TO_KES, escrowMSISDN } = require('../../../contants');

// 👍🏽
// parameters: {"phoneNumber" : "E.164 number" , "amount" : "value", "txhash" : "value"}
export const transactionWithdrawMpesaSend = async (req, res) => {
  console.log(`Received request for: ${req.url}`);
  try {
    const { phoneNumber } = req.body;
    const { txhash } = req.body;

    const { permissionLevel } = req.user;
    const targetCountry = getTargetCountry(permissionLevel, req.user.targetCountry);
    const userMSISDN = await validateMSISDN(phoneNumber, targetCountry);

    const _isValidPhoneNumber = await isValidPhoneNumber(userMSISDN, 'KE');
    if (!_isValidPhoneNumber) { return res.json({ status: 400, desc: `${userMSISDN} is not a valid KE phoneNumber` }); }
    const userId = await getUserId(userMSISDN);

    if (txhash == null || txhash == '') { return res.json({ status: 400, desc: 'Invalid Hash', comment: 'Transaction hash cannot be empty' }); }
    const txreceipt = await lib.validateCeloTransaction(txhash);
    if (txreceipt == null) { return res.json({ status: 400, desc: 'Invalid Transaction Receipt', comment: 'Only transactions to the Escrow address can be processed' }); }

    const escrowId = await getUserId(escrowMSISDN);
    const escrowInfo = await getUserDetails(escrowId);
    const escrowAddress = escrowInfo.data().publicAddress;
    const txdetails = await validateWithdrawHash(txhash, escrowAddress);
    if (txdetails.status != 'ok') { return res.json({ status: 400, desc: 'Invalid Hash', comment: `${txdetails.status}` }); }
    const validblocks = txdetails.txblock;
    let _validblocks = parseInt(validblocks);
    _validblocks += 1440;
    const latestblock = await getLatestBlock();
    const _latestblock = parseInt(latestblock.number);
    if (txreceipt.status != true || _validblocks < _latestblock) {
      return res.json({
        status: 400, desc: 'Invalid Transaction', blockNumber: txdetails.txblock, latestBlock: _latestblock,
      });
    }

    console.log('Processing MPESA withdraw Transaction');

    const userExists = await lib.checkIfSenderExists(userId);
    if (userExists === false) {
      const userCreated = await lib.createNewUser(userId, userMSISDN);
      console.log('Created user with userID: ', userCreated);
    }
    const isverified = await lib.checkIfUserisVerified(userId);
    console.log('isverified: ', isverified);
    if (!isverified) { return res.json({ status: 400, desc: 'user account is not verified' }); }

    const isProcessed = await lib.getProcessedTransaction(txhash);
    console.log('isProcessed: ', isProcessed);
    if (isProcessed) { return res.json({ status: 400, desc: 'Transaction Hash is already processed' }); }

    const withdrawDetails = {
      blockNumber: txdetails.txblock,
      value: `${txdetails.value} CUSD`,
      from: txdetails.from,
      to: txdetails.to,
      date: moment().format('YYYY-MM-DD, HH:mm:ss'),
    };
    const _cusdAmount = number_format(txdetails.value, 4);
    const usdMarketRate = await getExchangeRate(USD_TO_KES);
    const cusdWithdrawRate = usdMarketRate * 0.98;
    let kesAmountToReceive = _cusdAmount * cusdWithdrawRate;
    kesAmountToReceive = number_format(kesAmountToReceive, 0);
    console.log(`Withdraw Amount KES: ${kesAmountToReceive}`);
    const jengabalance = await jenga.getBalance();
    console.log(`Jenga Balance: KES ${jengabalance.balances[0].amount}`);

    if (kesAmountToReceive > jengabalance.balances[0].amount) { return res.json({ status: 400, desc: 'Not enough fiat balance to fulfill the request', comment: `Contact support to reverse your tx: ${txhash}` }); }
    // Add auto-reverse on the smartcontract (TimeLock)
    console.log(txhash, ' Transaction hash is valid...processing payout');
    const jengaResponse = await processApiWithdraw(userMSISDN, kesAmountToReceive, txhash);
    console.log(jengaResponse);
    await setProcessedTransaction(txhash, withdrawDetails);
    console.log(txhash, ' Transaction processing successful');
    res.json({
      status: 201,
      desc: 'Withdraw Transaction processing successful',
      cusdDetails: withdrawDetails,
      MpesaDetails: jengaResponse,
    });
  } catch (e) { console.log(e); res.json({ status: 400, desc: 'Invalid request' }); }
};

// parameters: {celloAddress, phoneNumber, amount}
// 👍🏽

export const transactionWithdrawGetMpesaStatus = async (req, res) => {
  try {
    const { permissionLevel } = req.user;
    const targetCountry = getTargetCountry(permissionLevel, req.user.targetCountry);
    if (targetCountry != 'KE') { return res.json({ status: 400, desc: 'Invalid request' }); }

    const { requestId } = req.body;
    const { requestDate } = req.body;
    const status = await jenga.getTransactionStatus(requestId, requestDate);
    const _mpesaref = status.mpesaref;

    if (_mpesaref.length > 2) { return res.json(status); }
    if (_mpesaref.length == 0) { return res.json({ status: 400, desc: 'Mpesa Transaction not found' }); }
  } catch (e) { res.json({ status: 400, user: 'Invalid request' }); }
};
