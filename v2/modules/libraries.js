// Firebase init
const functions = {} //require('firebase-functions');
const admin = {} //require('firebase-admin');

const firestore = {} // admin.firestore();
const crypto = require('crypto');
const bip39 = require('bip39-light');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const moment = require('moment');
const randomstring = require('randomstring');
const { getAddressUrl, createcypher, decryptcypher } = require('./utilities');

// ENV VARIABLES
const { iv, phone_hash_fn } = require('../src/contants/index');

const {
  getPublicAddress,
  generatePrivKey,
  weiToDecimal,
  sendcUSD,
  getContractKit,
} = require('./celokit');

const kit = getContractKit();
// Currency pairId
const USD_TO_KES = '3128952f1782f60c1cf95c5c3d13b4dc739f1a0d'; // USD_TO_KES
const KES_TO_USD = '883736ecb6bd36d6411c77bdf1351052a1f23c00'; // KES_TO_USD

// TODO: SAVINGS SACCO API
exports.generateAccessToken = (user) => {
  const SECRET_KEY = ENV_SECRET_KEY;
  return jwt.sign(user, SECRET_KEY, { expiresIn: '300s' });
};

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  const SECRET_KEY = ENV_SECRET_KEY;

  jwt.verify(token, SECRET_KEY, (err, user) => {
    console.log(JSON.stringify(err));
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

exports.decodeAuthToken = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  const decoded = jwt_decode(token);
  return decoded;
};

exports.validateCeloTransaction = async (txhash) => {
  const receipt = await kit.web3.eth.getTransactionReceipt(txhash);
  return receipt;
};

exports.checkisUserKyced = async (userId) => {
  return false
  /*const docRef = firestore.collection('kycdb').doc(userId);
  let isKyced = false;

  const doc = await docRef.get();
  if (!doc.exists) {
    isKyced = false; // Run KYC
    console.log('No such document!');
  } else {
    isKyced = true; // do nothing
    console.log('KYC Document Exists => ', JSON.stringify(doc.data()));
  }
  return isKyced;*/
};

exports.hasSeedKey = async (userId) => {
  const docRef = firestore.collection('accounts').doc(userId);
  let hasAddress = false;

  const doc = await docRef.get();
  if (!doc.exists) {
    hasAddress = false; // Run KYC
    console.log('No such document!');
  } else {
    hasAddress = true; // do nothing
    console.log('KYC Document Exists => ', JSON.stringify(doc.data()));
  }
  return hasAddress;
};

exports.getPhoneNumberByAddress = async (publicAddress) => {
  try {
    const arrIds = [];

    console.log('Before check...');
    await firestore
      .collection('accounts')
      .where('publicAddress', '==', publicAddress)
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          console.log(doc.id, '=>', JSON.stringify(doc.data()));
          arrIds.push(doc.id);
        });
      });
    return arrIds;
  } catch (e) {
    console.log(e);
  }
};

exports.checkisSaccoUserKyced = async (userId) => {
  const docRef = firestore.collection('saccokycdb').doc(userId);
  let isKyced = false;

  const doc = await docRef.get();
  if (!doc.exists) {
    isKyced = false; // Run KYC
    console.log('No such document!');
  } else {
    isKyced = true; // do nothing
    console.log('KYC Document Exists => ', JSON.stringify(doc.data()));
  }
  return isKyced;
};

exports.checkifDataIsLogged = async (txid) => {
  const docRef = firestore.collection('chainbeat').doc(txid);
  let isLogged = false;

  const doc = await docRef.get();
  if (!doc.exists) {
    isLogged = false; // Log Data
    console.log('No such document!');
  } else {
    isLogged = true; // do nothing
    console.log('KYC Document Exists => ', JSON.stringify(doc.data()));
  }
  return isLogged;
};

exports.getProcessedTransaction = async (txhash) => {
  const docRef = firestore.collection('processedtxns').doc(txhash);
  let processed = false;

  const doc = await docRef.get();
  if (!doc.exists) {
    processed = false; // create the document
    console.log('No such document!');
  } else {
    processed = true; // do nothing
    console.log('Document data:', JSON.stringify(doc.data()));
  }
  return processed;
};

exports.setProcessedTransaction = async (txhash, txdetails) => {
  try {
    const db = firestore.collection('processedtxns').doc(txhash);
    db.set(txdetails).then((newDoc) => {
      console.log('Transaction processed: => ', newDoc.id);
    });
  } catch (err) {
    console.log(err);
  }
};

exports.logJengaProcessedTransaction = async (txid, txdetails) => {
  try {
    const db = firestore.collection('jengaWithdrawTxns').doc(txid);
    db.set(txdetails).then((newDoc) => {
      console.log('Jenga Transaction processed');
    });
  } catch (err) {
    console.log(err);
  }
};

exports.logJengaFailedTransaction = async (txid, txdetails) => {
  try {
    const db = firestore.collection('jengaFailedWithdraws').doc(txid);
    db.set(txdetails).then((newDoc) => {
      console.log('Jenga Failed Transaction logged: => ', newDoc.id);
    });
  } catch (err) {
    console.log(err);
  }
};

exports.logUssdSessions = async (sessionId, sessionData) => {
  try {
    const db = firestore.collection('ussdSessions').doc(sessionId);
    await db.set(sessionData);
    console.log('USSD Session logged...');
  } catch (e) {
    console.log(e);
  }
};

exports.logChainbeatData = async (txid, txdata) => {
  try {
    const db = firestore.collection('chainbeat').doc(txid);
    db.set(txdata).then((newDoc) => {
      console.log('Blockchain Data logged ');
    });
  } catch (err) {
    console.log(err);
  }
};

exports.checkIfUserAccountExist = async (userId, userMSISDN) => {
  const userExists = await checkIfSenderExists(userId);
  if (userExists === false) {
    const userCreated = await createNewUser(userId, userMSISDN);
    console.log('Created user with userID: ', userCreated);
  }
};

exports.checkIsUserVerified = async (senderId) => {
  const isverified = await checkIfUserisVerified(senderId);
  if (isverified === false) {
    return {
      status: 'unverified',
      desc: 'user account is not verified',
    };
  }
};

// USSD APP
exports.getAccDetails = async (userMSISDN) => {
  const userId = await getUserId(userMSISDN);
  const userInfo = await getUserDetails(userId);
  const url = await getAddressUrl(`${userInfo.data().publicAddress}`);
  return `CON Your Account Number is: ${userMSISDN} \nAccount Address is: ${url}`;
};

const getUserPrivateKey = async (seedCypher, senderMSISDN, iv) => {
  try {
    const senderSeed = await decryptcypher(seedCypher, senderMSISDN, iv);
    const senderprivkey = `${await generatePrivKey(senderSeed)}`;
    return new Promise((resolve) => {
      resolve(senderprivkey);
    });
  } catch (err) {
    console.log('Unable to decrypt cypher');
  }
};
exports.getSenderPrivateKey = getUserPrivateKey;
exports.getUserPrivateKey = getUserPrivateKey;

exports.getSeedKey = async (userMSISDN) => {
  const userId = await getUserId(userMSISDN);
  const userInfo = await getUserDetails(userId);
  const decr_seed = await decryptcypher(userInfo.data().seedKey, userMSISDN, iv);
  return `END Your Backup Phrase is:\n ${decr_seed}`;
};

exports.getPinFromUser = () => new Promise((resolve) => {
  const loginpin = randomstring.generate({ length: 4, charset: 'numeric' });
  resolve(loginpin);
});

exports.addUserKycToDB = async (userId, kycdata) => {
  try {
    const db = firestore.collection('kycdb').doc(userId);
    await db.set(kycdata);
    console.log('KYC Document Created: ');
  } catch (e) {
    console.log(e);
  }
};

exports.addKotaniPartnerAccount = async (userId, kycdata) => {
  try {
    const db = firestore.collection('KotaniPartners').doc(userId);
    const newDoc = await db.set(kycdata);
    console.log('Partner Account Added:');
  } catch (e) {
    console.log(e);
  }
};

exports.addUserDataToDB = async (userId, userMSISDN) => {
  try {
    const mnemonic = await bip39.generateMnemonic(256);
    const enc_seed = await createcypher(mnemonic, userMSISDN, iv);
    const publicAddress = await getPublicAddress(mnemonic);
    const createdAt = moment().unix();
    const newAccount = {
      seedKey: `${enc_seed}`,
      publicAddress: `${publicAddress}`,
      createdAt,
    };
    const db = firestore.collection('accounts').doc(userId);
    await db.set(newAccount).then((newDoc) => {
      console.log('Document Created: ', newDoc.id);
    });
    return newAccount;
  } catch (err) {
    console.log('accounts db error: ', err);
  }

  // return true;
};

exports.signupDeposit = async (publicAddress) => {
  const escrowMSISDN = functions.config().env.escrow.msisdn;
  const escrowId = await getUserId(escrowMSISDN);
  const escrowInfo = await getUserDetails(escrowId);
  const escrowPrivkey = await getSenderPrivateKey(
    escrowInfo.data().seedKey,
    escrowMSISDN,
    iv
  );

  const receipt = await sendcUSD(
    escrowInfo.data().publicAddress,
    publicAddress,
    '0.01',
    escrowPrivkey
  );
  console.log(`Signup deposit tx hash: ${receipt.transactionHash}`);
  return receipt.transactionHash;
};

const getUserDetails = async (senderId) => {
  const db = firestore.collection('accounts').doc(senderId);
  const result = await db.get();
  return result;
};

exports.getUserDetails = getUserDetails;
exports.getSenderDetails = getUserDetails;
exports.getReceiverDetails = getUserDetails;

exports.getKotaniPartnerDetails = async (userId) => {
  const db = firestore.collection('KotaniPartners').doc(userId);
  const result = await db.get();
  return result;
};

exports.getSaccoSenderDetails = async (senderId) => {
  const db = firestore.collection('accounts').doc(senderId);
  const result = await db.get();
  return result;
};

exports.getLoginPin = async (userId) => {
  const db = firestore.collection('hashfiles').doc(userId);
  const result = await db.get();
  return result.data().enc_pin;
};

exports.getAllAccounts = async () => {
  const snapshot = await firestore.collection('accounts').get();
  const collection = [];
  snapshot.forEach((doc) => {
    collection.push(doc.data().publicAddress);
  });
  return collection;
};

const getUserById = async (uid) => {
  try {
    const userData = await admin.auth().getUser(uid);
    return userData;
  } catch (e) {}
};
exports.getUserById = getUserById;

exports.getAllAccountsDetails = async () => {
  const snapshot = await firestore.collection('accounts').get();
  const collection = [];
  snapshot.forEach(async (doc) => {
    collection.push({
      address: doc.data().publicAddress,
      createdAt: doc.data().createdAt,
    });
  });
  return collection;
};

exports.getAllAccountsWithId = async () => {
  const snapshot = await firestore.collection('accounts').get();
  const collection = [];
  snapshot.forEach(async (doc) => {
    collection.push({
      id: doc.id,
      address: doc.data().publicAddress,
      createdAt: doc.data().createdAt,
    });
  });
  return collection;
};

const getExchangeRate = async (pairId) => {
  console.log('getting exchange rate');
  const db = firestore.collection('exchangeRate').doc(pairId);
  const result = await db.get();
  const exchangeRate = result.data().value;
  console.log('Exchange rate', exchangeRate);
  return exchangeRate;
};
exports.getExchangeRate = getExchangeRate;

const number_format = (val, decimals) => parseFloat(val).toFixed(decimals);
exports.number_format = number_format;

exports.getWithdrawerBalance = async (publicAddress) => {
  const cusdtoken = await kit.contracts.getStableToken();
  const cusdbalance = await cusdtoken.balanceOf(publicAddress); // In cUSD
  let _cusdbalance = await weiToDecimal(cusdbalance);
  _cusdbalance = number_format(_cusdbalance, 4);
  return _cusdbalance;
};

exports.getAccBalance = async (userMSISDN) => {
  const usdMarketRate = await getExchangeRate(USD_TO_KES);
  const userId = await getUserId(userMSISDN);
  const userInfo = await getUserDetails(userId);
  const cusdtoken = await kit.contracts.getStableToken();
  const cusdbalance = await cusdtoken.balanceOf(userInfo.data().publicAddress); // In cUSD
  let _cusdbalance = await weiToDecimal(cusdbalance);
  console.info(`Account balance of ${_cusdbalance} CUSD`);
  _cusdbalance = number_format(_cusdbalance, 4);
  const celotoken = await kit.contracts.getGoldToken();
  const celobalance = await celotoken.balanceOf(userInfo.data().publicAddress); // In cGLD
  const _celobalance = await weiToDecimal(celobalance);
  console.info(`Account balance of ${_celobalance} CELO`);
  return _cusdbalance;
};

const getUserId = (senderMSISDN) => new Promise((resolve) => {
  const senderId = crypto
    .createHash(phone_hash_fn)
    .update(senderMSISDN)
    .digest('hex');
  resolve(senderId);
});
exports.getSenderId = getUserId;
exports.getUserId = getUserId;
exports.getRecipientId = getUserId;
exports.getPairId = getUserId;

const checkIfUserExists = async (userId) => {
  let exists;
  return true;
  /*return new Promise((resolve) => {
    admin
      .auth()
      .getUser(userId)
      .then((userRecord) => {
        if (userRecord) {
          exists = true;
          resolve(exists);
        } else {
          exists = false;
          resolve(exists);
        }
      })
      .catch((error) => {
        console.log('Error fetching user data:', userId, 'does not exists:\n');
        exists = false;
        resolve(exists);
      });
  });*/
};

exports.checkIfSenderExists = checkIfUserExists;
exports.checkIfRecipientExists = checkIfUserExists;

exports.checkIfUserisVerified = async (userId) => {
  let isVerified;
  return new Promise((resolve) => {
    admin
      .auth()
      .getUser(userId)
      .then((userRecord) => {
        if (userRecord.customClaims.verifieduser === true) {
          isVerified = true;
          resolve(isVerified);
        } else {
          isVerified = false;
          resolve(isVerified);
        }
      })
      .catch((error) => {
        isVerified = false;
        resolve(isVerified);
      });
  });
};

// Validates email address of course.
exports.validEmail = (e) => {
  const filter = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
  return String(e).search(filter) != -1;
};

exports.sleep = (ms) => Promise((resolve) => setTimeout(resolve, ms));

// .then(admin.auth().setCustomUserClaims(userId, {verifieduser: false}))
exports.createNewUser = async (userMSISDN) => {
  const user = makeAuth({ phoneNumber: userMSISDN }, lib.getUserId);
  await accDb.createAuth(user);
};

exports.verifyNewUser = async (
  userId,
  email,
  newUserPin,
  firstname,
  lastname,
  idnumber,
  dateofbirth,
  userMSISDN
) => new Promise((resolve) => {
  admin
    .auth()
    .updateUser(userId, {
      email: `${email}`,
      emailVerified: false,
      displayName: `${firstname} ${lastname}`,
      idnumber: `${idnumber}`,
      dateofbirth: `${dateofbirth}`,
      disabled: false,
    })
    .then((userRecord) => {
      admin
        .auth()
        .setCustomUserClaims(userRecord.uid, { verifieduser: true });
      resolve(userRecord.uid);
    })
    .catch((error) => {
      console.log('Error updating user:', error);
    });
});

exports.getTargetCountry = (permissionLevel, targetCountry) => {
  let _targetCountry;
  if (permissionLevel == 'partner') {
    _targetCountry = targetCountry;
    return _targetCountry;
  }
  _targetCountry = 'KE';
  return _targetCountry;
};

exports.getTargetEscrow = (targetCountry, escrow) => {
  if (targetCountry == 'KE') {
    return escrow.kotanilabs.msisdn;
  }
  if (targetCountry == 'ZM') {
    return escrow.savingsacco.msisdn;
  }
  if (targetCountry == 'GH') {
    return escrow.bezomoney.msisdn;
  }
  return null;
};

exports.getLocalCurrencyAmount = async (cusdBalance, pair) => {
  const balanceInEther = await weiToDecimal(cusdBalance);
  const pairId = await getUserId(pair);
  const exchangeRate = await getExchangeRate(pairId);
  return parseFloat(balanceInEther * exchangeRate, 4);
};

exports.generateLoginPin = () => new Promise((resolve) => {
  resolve(randomstring.generate({ length: 5, charset: 'numeric' }));
});

exports.updateJengaFailedTransaction = async (txid, txdetails) => {
  try {
    const docRef = firestore.collection('jengaFailedWithdraws').doc(txid);
    const res = await docRef.update(txdetails);
  } catch (err) {
    console.log(err);
  }
};
