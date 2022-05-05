const admin = require('firebase-admin');

const firestore = admin.firestore();
const {
  getUserId, getUserDetails, getTargetCountry, getLocalCurrencyAmount, number_format, checkIfSenderExists, checkisUserKyced,
} = require('../../modules/libraries');
const lib = require('../../modules/libraries');
const { generateAccessToken } = require('../../modules');
const {
  createcypher, sendMessage, isValidPhoneNumber, validateMSISDN,
} = require('../../modules/utilities');
// GLOBAL ENV VARIABLES
const { iv } = require('../contants');
const { weiToDecimal, getContractKit } = require('../../modules/celokit');

const kit = getContractKit();

// 👍🏽
export const login = async (req, res) => {
  const userMSISDN = await validateMSISDN(req.body.phoneNumber, req.body.countryCode);
 //console.log('MSISDN:', userMSISDN);
  const userId = await lib.getUserId(userMSISDN);

  const userInfo = await lib.getKotaniPartnerDetails(userId);
  if (userInfo.data() === undefined || userInfo.data() === null || userInfo.data() === '') {
    return res.status(400).send('Cannot find user');
  }
  try {
    if (await bcrypt.compare(req.body.password, userInfo.data().password)) {
      const accessToken = generateAccessToken(userInfo.data());
      res.json({ status: 201, accessToken });
    } else { return res.json({ status: 400, desc: 'Not Allowed' }); }
  } catch (e) {//console.log(e);
    res.status(500).send(); }
};

// 👍🏽
export const resetPin = async (req, res) => {
  try {
   //console.log(`Received request for: ${req.url}`);
    const { phoneNumber } = req.body;
    const { newUserPin } = req.body;
    const { permissionLevel } = req.user;
    const userNumber = req.user.phoneNumber;
   //console.log('UserNumber: ', userNumber, 'permission: ', permissionLevel);

    if (permissionLevel !== 'support' && permissionLevel !== 'admin') { return res.status(401).send({ status: 'Unauthorized' }); }
    const targetCountry = getTargetCountry(permissionLevel, req.user.targetCountry);
    const _isValidPhoneNumber = await isValidPhoneNumber(phoneNumber, targetCountry);
   //console.log('isValidPhoneNumber ', _isValidPhoneNumber);

    if (!_isValidPhoneNumber) { return res.json({ status: 400, desc: 'Invalid PhoneNumber' }); }

    if (_isValidPhoneNumber) {
      const userMSISDN = await validateMSISDN(phoneNumber, targetCountry);

      const userId = await getUserId(userMSISDN);
      const userstatusresult = await checkIfSenderExists(userId);
      if (!userstatusresult) {
        //console.log('User does not exist: ');
        return res.json({ status: 400, desc: 'User does not exist' }); }

      const isKyced = await checkisUserKyced(userId);
      if (!isKyced) { return res.json({ status: 400, desc: 'User is not KYC\'ed' }); }
      if (newUserPin.length < 4) { return res.json({ status: 400, desc: 'PIN must be atleast 4 characters' }); }
     //console.log('newUserPin', newUserPin);
      const enc_loginpin = await createcypher(newUserPin, userMSISDN, iv);
      await firestore.collection('hashfiles').doc(userId).update({ enc_pin: `${enc_loginpin}` });
      const message2sender = `Your Kotani Pay PIN has been updated.\nDial *483*354# to access the KotaniPay Ecosystem.\nNew User PIN: ${newUserPin}`;
      sendMessage(`+${userMSISDN}`, message2sender);

      res.json({ status: 201, desc: `${userMSISDN} Kotani Pay PIN updated successfully` });
    }
  }
  catch (e) {
      //console.log(JSON.stringify(e));
      res.json({ status: 400, desc: 'invalid information provided' });
    }
};

// 👍🏽
// parameter: {"phoneNumber" : "E.164 number" }
export const getBalance = async (req, res) => {
 //console.log(`Received request for: ${req.url}`);
  try {
    const { localCurrency } = req.user;
    const { permissionLevel } = req.user;
    if (permissionLevel != 'partner' && permissionLevel != 'admin') { return res.json({ status: 400, desc: 'Unauthorized request' }); }
    // eslint-disable-next-line max-len
    const targetCountry = getTargetCountry(permissionLevel, req.user.targetCountry); // req.user.targetCountry;

    const userMSISDN = await validateMSISDN(`${req.body.phoneNumber}`, targetCountry);
    const _isValidPhoneNumber = await isValidPhoneNumber(userMSISDN, targetCountry);
    if (!_isValidPhoneNumber) {
      return res.json({
        status: 400, user: `${req.user.name}`, phoneNumber: `${userMSISDN}`, desc: 'Invalid phoneNumber',
      });
    }

    const userId = await getUserId(userMSISDN);
    const userstatusresult = await checkIfSenderExists(userId);
   //console.log('User Exists? ', userstatusresult);
    if (!userstatusresult) { return res.json({ status: 400, desc: 'user does not exist' }); }
    const userInfo = await getUserDetails(userId);
   //console.log('User Address => ', userInfo.data().publicAddress);

    const cusdtoken = await kit.contracts.getStableToken();
    const cusdBalance = await cusdtoken.balanceOf(userInfo.data().publicAddress); // In cUSD
   //console.log(`CUSD Balance Before: ${cusdBalance}`);
    console.info(`Account balance of ${await weiToDecimal(cusdBalance)} CUSD`);
    const localCurrencyAmount = await getLocalCurrencyAmount(cusdBalance, `usd_to_${localCurrency}`);
    res.json({
      status: 201,
      address: `${userInfo.data().publicAddress}`,
      balance: {
        currency: localCurrency.toUpperCase(),
        amount: number_format(localCurrencyAmount, 4),
      },
    });
  } catch (e) {//console.log(e); res.json({ status: 400, desc: 'invalid request' }); }
};

// 👍🏽
export const userAccountDetails = async (req, res) => {
 //console.log(`Received request for: ${req.url}`);
  try {
    const { permissionLevel } = req.user;
    const targetCountry = getTargetCountry(permissionLevel, req.user.targetCountry);
    if (permissionLevel !== 'partner' && permissionLevel !== 'admin' && permissionLevel !== 'support') { return res.json({ status: 400, desc: 'Unauthorized request' }); }

    const userMSISDN = await validateMSISDN(`${req.body.phoneNumber}`, targetCountry);
    const _isValidPhoneNumber = await isValidPhoneNumber(userMSISDN, targetCountry);
   //console.log(`isValid ${targetCountry} PhoneNumber `, _isValidPhoneNumber);

    if (!_isValidPhoneNumber) { return res.json({ status: 400, phoneNumber: `${userMSISDN}`, message: `Invalid ${targetCountry} phoneNumber` }); }

    const userId = await getUserId(userMSISDN);
   //console.log('UserId: ', userId);

    const userstatusresult = await checkIfSenderExists(userId);
   //console.log('User Exists? ', userstatusresult);
    if (!userstatusresult) { return res.json({ status: 400, desc: 'user does not exist' }); }

    const userInfo = await getUserDetails(userId);
    res.json({ status: 201, address: `${userInfo.data().publicAddress}` });
  } catch (e) {
    //console.log(e);
    res.json({ status: 400, desc: 'invalid request' });
  }
  }
};
