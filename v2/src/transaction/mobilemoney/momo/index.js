const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {
  getUserId,
  getUserDetails,
  getTargetCountry,
  number_format,
  getExchangeRate,
} = require('../../../../modules/libraries');
const lib = require('../../../../modules/libraries');
const {
  getTxidUrl,
  isValidPhoneNumber,
  validateMSISDN,
} = require('../../../../modules/utilities');
const { sendcUSD, getContractKit } = require('../../../../modules/celokit');

const kit = getContractKit();
const { GHS_TO_USD, iv } = require('../../../contants');

// @params: { "depositPhoneNumber" : "String", "depositAmount" : { "currency" : "String", "amount" : "String" } }
// 👍🏽
export const transactionDepositMomo = async (req, res) => {
  try {
    const { permissionLevel } = req.user;
    const targetCountry = getTargetCountry(
      permissionLevel,
      req.user.targetCountry
    );
    const escrowMSISDN = functions.config().env.escrow.bezomoney.msisdn;
    let depositorMSISDN = req.body.phoneNumber;
    const depositCurrency = req.body.currency;
    const { amount } = req.body;
    const _depositorIsValidZMPhoneNumber = isValidPhoneNumber(depositorMSISDN);
    console.log(
      depositorMSISDN,
      'Depositor isValidGhPhoneNumber ',
      _depositorIsValidZMPhoneNumber
    );

    if (_depositorIsValidZMPhoneNumber) {
      depositorMSISDN = phoneUtil.format(
        phoneUtil.parseAndKeepRawInput(`${depositorMSISDN}`, 'GH'),
        PNF.E164
      );
      depositorMSISDN = depositorMSISDN.substring(1);
      const depositorId = await getUserId(depositorMSISDN);

      const depositorstatusresult = await lib.checkIfRecipientExists(
        depositorId
      );
      if (!depositorstatusresult) {
        return res.json({ status: 400, desc: 'user account does not exist' });
      }

      const isverified = await lib.checkIfUserisVerified(depositorId);
      console.log('isverified: ', isverified);
      if (!isverified) {
        return res.json({ status: 400, desc: 'user account is not verified' });
      }

      // Send funds to the depositor CUSD account
      const escrowId = await getUserId(escrowMSISDN);
      let depositorInfo = await lib.getUserDetails(depositorId);
      while (
        depositorInfo.data() === undefined
        || depositorInfo.data() === null
        || depositorInfo.data() === ''
      ) {
        sleep(1000);
        depositorInfo = lib.getUserDetails(depositorId);
        // console.log('Receiver:', receiverInfo.data());
      }
      console.log('User Address => ', depositorInfo.data().publicAddress);
      console.log('depositorId: ', depositorId);

      await admin
        .auth()
        .getUser(depositorId)
        .then((user) => {
          console.log('Depositor fullName: ', user.displayName);
          // displayName = user.displayName;
        })
        .catch((e) => {
          console.log(e);
        });

      // Retrieve User Blockchain Data
      const depositInfo = await lib.getUserDetails(depositorId);
      const escrowInfo = await lib.getReceiverDetails(escrowId);
      const escrowprivkey = await lib.getSenderPrivateKey(
        escrowInfo.data().seedKey,
        escrowMSISDN,
        iv
      );
      let cusdAmount = number_format(amount, 4);
      const ghs_to_usd = await getExchangeRate(GHS_TO_USD);
      if (depositCurrency === 'GHS') {
        cusdAmount *= ghs_to_usd;
      }

      console.log(`CUSD deposit amount: ${cusdAmount}`);

      const receipt = await sendcUSD(
        escrowInfo.data().publicAddress,
        depositInfo.data().publicAddress,
        `${cusdAmount}`,
        escrowprivkey
      );
      const url = await getTxidUrl(receipt.transactionHash);

      res.json({
        status: 201,
        phoneNumber: `${escrowMSISDN}`,
        amountDeposited: { currency: 'GHS', amount: `${amount}` },
        txnHash: `${receipt.transactionHash}`,
        depositReference: 'fiatTxnReferenceId',
      });
    } else {
      res.json({
        status: 400,
        phoneNumber: `${escrowMSISDN}`,
        desc: 'The number provided is not a valid phoneNumber',
      });
    }
  } catch (e) {
    console.log('Error: ', e);
    res.json({ status: 400, desc: 'your request is invalid' });
  }
};

export const transactionWithdrawMomo = async (req, res) => {
  try {
    console.log(`Received request for: ${req.url}`);
    const { phoneNumber } = req.body;
    const { amount } = req.body;
    const { fiatTxnReferenceId } = req.body;

    const { permissionLevel } = req.user;
    if (permissionLevel !== 'partner') {
      return res.status(401).send({ status: 'Unauthorized' });
    }

    const targetCountry = getTargetCountry(
      permissionLevel,
      req.user.targetCountry
    );
    let escrowMSISDN;
    if (targetCountry === 'GH') {
      escrowMSISDN = functions.config().env.escrow.bezomoney.msisdn;
    } else {
      escrowMSISDN = functions.config().env.escrow.equitel;
    }

    const withdrawMSISDN = await validateMSISDN(phoneNumber, targetCountry);
    const _isValidPhoneNumber = await isValidPhoneNumber(
      withdrawMSISDN,
      targetCountry
    );
    if (!_isValidPhoneNumber) {
      return res.json({
        status: 400,
        phoneNumber: `${withdrawMSISDN}`,
        desc: 'invalid phoneNumber',
      });
    }
    const withdrawerId = await getUserId(withdrawMSISDN);

    const withdrawerstatusresult = await lib.checkIfRecipientExists(
      withdrawerId
    );
    if (!withdrawerstatusresult) {
      return res.json({ status: 400, desc: 'user account does not exist' });
    }

    const isverified = await lib.checkIfUserisVerified(withdrawerId);
    if (!isverified) {
      return res.json({ status: 400, desc: 'user account is not verified' });
    }

    const escrowId = await getUserId(escrowMSISDN);
    const withdrawerInfo = await getUserDetails(withdrawerId);
    console.log('User Address => ', withdrawerInfo.data().publicAddress);
    console.log('withdrawerId: ', withdrawerId);

    const userData = await admin.auth().getUser(withdrawerId);
    console.log('Withdrawer fullName: ', userData.displayName);

    // Retrieve User Blockchain Data
    const escrowInfo = await lib.getReceiverDetails(escrowId);
    const withdrawerprivkey = await lib.getSenderPrivateKey(
      withdrawerInfo.data().seedKey,
      withdrawMSISDN,
      iv
    );
    let cusdAmount = number_format(amount, 4);
    const ghs_to_usd = await getExchangeRate(GHS_TO_USD);
    cusdAmount *= ghs_to_usd;
    cusdAmount = number_format(cusdAmount, 4);
    const cusdtoken = await kit.contracts.getStableToken();
    const cusdBalance = await cusdtoken.balanceOf(
      withdrawerInfo.data().publicAddress
    );
    if (cusdAmount > parseFloat(cusdBalance, 4)) {
      return res.json({ status: 400, desc: 'insufficient balance' });
    }

    console.log(`CUSD withdraw amount: ${cusdAmount}`);

    const receipt = await sendcUSD(
      withdrawerInfo.data().publicAddress,
      escrowInfo.data().publicAddress,
      `${cusdAmount}`,
      withdrawerprivkey
    );
    const url = await getTxidUrl(receipt.transactionHash);
    console.log('tx URL', url);

    res.json({
      status: 201,
      phoneNumber: `${withdrawMSISDN}`,
      amountWithdrawn: { currency: `${targetCountry}S`, amount: `${amount}` },
      txnHash: `${receipt.transactionHash}`,
      withdrawReference: `${fiatTxnReferenceId}`,
    });

    console.log(parseInt(cusdAmount * ghs_to_usd, 10));
  } catch (e) {
    console.log('Error: ', e);
    res.json({ status: 400, desc: 'Invalid request' });
  }
};
