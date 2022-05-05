const admin = require('firebase-admin');

const firestore = admin.firestore();
const { invalid } = require('moment');
const {
  getUserId,
  getTargetCountry,
  checkIfSenderExists,
  checkisUserKyced,
  addUserKycToDB,
} = require('../../modules/libraries');
const lib = require('../../modules/libraries');
const {
  getPinFromUser,
  createcypher,
  sendMessage,
  isValidPhoneNumber,
  validateMSISDN,
} = require('../../modules/utilities');
// GLOBAL ENV VARIABLES
const { iv } = require('../contants');

// 👍🏽
export const kycUserUpdate = async (req, res) => {
  try {
    // console.log(`Received request for: ${req.url}`);
    const { phoneNumber } = req.body;

    const userNumber = req.user.phoneNumber;
    // console.log('UserNumber: ', userNumber);
    const { permissionLevel } = req.user;

    if (userNumber !== '+254720670789' || permissionLevel !== 'partner') {
      return res.status(401).send({ status: 'Unauthorized' });
    }
    const targetCountry = getTargetCountry(
      permissionLevel,
      req.user.targetCountry
    );

    const kycReqData = req.body;
    // console.log(`KYC DATA: ${JSON.stringify(kycReqData)}`);
    let userMSISDN = '';

    const _isValidKePhoneNumber = isValidPhoneNumber(
      phoneNumber,
      targetCountry
    );
    // console.log('isValidKePhoneNumber ', _isValidKePhoneNumber);

    if (!_isValidKePhoneNumber) {
      return res.json({ status: 400, Details: 'Invalid PhoneNumber' });
    }

    if (_isValidKePhoneNumber) {
      userMSISDN = await validateMSISDN(phoneNumber, targetCountry);
      const userId = await getUserId(userMSISDN);
      const userstatusresult = await checkIfSenderExists(userId);
      if (!userstatusresult) {
        // console.log('User does not exist: ');
        return res.json({ status: 400, desc: 'User does not exist' });
      }

      const isKyced = await checkisUserKyced(userId);
      if (isKyced) {
        return res.json({ status: 400, desc: 'KYC Document already exists' });
      }

      const newUserPin = await getPinFromUser();
      // console.log('newUserPin', newUserPin);
      const enc_loginpin = await createcypher(newUserPin, userMSISDN, iv);
      const userdata = {
        displayName: `${kycReqData.fullname}`,
        disabled: false,
      };
      await admin.auth().updateUser(userId, userdata);
      await admin
        .auth()
        .setCustomUserClaims(userId, {
          verifieduser: true,
          impactmarket: true,
        });
      // console.log('User has been verified');
      await firestore
        .collection('hashfiles')
        .doc(userId)
        .set({ enc_pin: `${enc_loginpin}` });
      await addUserKycToDB(userId, kycReqData);

      const message2sender = `Welcome to Kotanipay.\nYour account details have been verified.\nDial *483*354# to access the KotaniPay Ecosystem.\nUser PIN: ${newUserPin}`;
      sendMessage(`+${userMSISDN}`, message2sender);

      res.json({ status: 201, Details: 'KYC completed successfully' });
    }
  } catch (e) {
    // console.log(e);
    res.json({ status: 400, desc: 'Invalid information provided' });
  }
};

// 👍🏽
export const kycUserActivate = async (req, res) => {
  try {
    const { permissionLevel } = req.user;
    if (permissionLevel !== 'admin' || permissionLevel !== 'partner') {
      return res.status(401).send({ status: 'Unauthorized' });
    }

   
    const targetCountry = getTargetCountry(
      permissionLevel,
      req.user.targetCountry
    );

    // console.log(`Received request for: ${req.url}`);
    const { phoneNumber } = req.body;
    const _isValidPhoneNumber = isValidPhoneNumber(phoneNumber, targetCountry);
    // console.log('isValidPhoneNumber ', _isValidPhoneNumber);

    if (!_isValidPhoneNumber) {
      return res.json({ status: 400, desc: 'Invalid PhoneNumber' });
    }

    const userMSISDN = await validateMSISDN(phoneNumber, targetCountry);
    const userId = await getUserId(userMSISDN);
    // console.log('UserId: ', userId);

    const userstatusresult = await checkIfSenderExists(userId);
    if (!userstatusresult) {
      // console.log('User does not exist: ');
      return res.json({ status: 400, desc: 'User does not exist' });
    }

    await admin
      .auth()
      .setCustomUserClaims(userId, { verifieduser: true, impactmarket: true });
    // console.log('User has been verified');
    res.json({ status: 201, desc: 'User has been verified' });
  } catch (e) {
    // console.log(e);
    res.json({ status: 400, desc: 'Invalid PhoneNumber Supplied' });
  }
};
// 👍🏽
export const kycUserCreate = async (req, res) => {
  // console.log(`Received request for: ${req.url}`);
  try {
    const { phoneNumber } = req.body;
    // console.log(JSON.stringify(req.body));

    const { permissionLevel } = req.user;
    const targetCountry = getTargetCountry(
      permissionLevel,
      req.user.targetCountry
    );

    const _isValidPhoneNumber = isValidPhoneNumber(phoneNumber, targetCountry);
    // console.log('isValidKePhoneNumber ', _isValidPhoneNumber);
    if (!_isValidPhoneNumber) {
      return res.json({ status: 400, desc: 'invalid phoneNumber' });
    }

    const userMSISDN = await validateMSISDN(phoneNumber, targetCountry);

    const userId = await lib.getUserId(userMSISDN);
    // console.log('senderId: ', userId);
    const userExists = await lib.checkIfSenderExists(userId);
    // console.log('Sender Exists? ', userExists);
    if (userExists) {
      return res.json({ status: 400, desc: 'user exists', userId });
    }

    if (!userExists) {
      await lib.createNewUser(userId, userMSISDN);
      // console.log('Created user with userID: ', userId);
      res.json({ status: 201, userId });
    }
  } catch (e) {
    res.json({ status: 400, desc: 'Invalid PhoneNumber Supplied' });
  }
};

// 👍🏽
export const kycUserIsVerifiedCheck = async (req, res) => {
  // console.log(`Received request for: ${req.url}`);
  try {
    const { phoneNumber } = req.body;
    const { permissionLevel } = req.user;
    const targetCountry = getTargetCountry(
      permissionLevel,
      req.user.targetCountry
    );

    const userMSISDN = await validateMSISDN(phoneNumber, targetCountry);

    const _isValidPhoneNumber = isValidPhoneNumber(userMSISDN, targetCountry);
    if (!_isValidPhoneNumber) {
      return res.json({ status: 400, desc: 'invalid phoneNumber' });
    }

    const userId = await lib.getUserId(userMSISDN);
    // console.log('UserId: ', userId);

    const userExists = await lib.checkIfSenderExists(userId);
    // console.log('User Exists? ', userExists);
    if (!userExists) {
      return res.json({ status: 400, desc: 'user does not exist' });
    }

    const isverified = await lib.checkIfUserisVerified(userId);
    // console.log('isverified: ', isverified);

    res.json({ status: isverified });
  } catch (e) {
    res.json({ status: 400 });
  }
};

// 👍🏽
// Parameters: phoneNumber
export const kycUserGetDetailsByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const { permissionLevel } = req.user;
    const targetCountry = getTargetCountry(
      permissionLevel,
      req.user.targetCountry
    );

    const _isValidPhoneNumber = isValidPhoneNumber(userMSISDN, targetCountry);
    // console.log('isValidKePhoneNumber ', _isValidPhoneNumber);
    if (!_isValidPhoneNumber) {
      return res.json({ status: 400, desc: 'Invalid PhoneNumber' });
    }

    let userMSISDN = await validateMSISDN(phoneNumber, targetCountry);
    const userRecord = await admin
      .auth()
      .getUserByPhoneNumber(`+${userMSISDN}`);
    // console.log('Successfully fetched user data: ', JSON.stringify(userRecord.toJSON()));
    res.json(userRecord.toJSON());
  } catch (e) {
    // console.log('PhoneNumber not found', JSON.stringify(e));
    res.json({ status: 400 });
  }
};

// 👍🏽
export const kycUserSetDetails = async (req, res) => {
  try {
    // console.log(`Received request for: ${req.url}`);
    const { phoneNumber } = req.body;
    const { permissionLevel } = req.user;

    if (permissionLevel !== 'partner' && permissionLevel !== 'support') {
      return res.status(401).send({ status: 'Unauthorized' });
    }
    const targetCountry = getTargetCountry(
      permissionLevel,
      req.user.targetCountry
    );

    const kycReqData = req.body;
    // console.log(`KYC DATA: ${JSON.stringify(kycReqData)}`);

    const _isValidPhoneNumber = isValidPhoneNumber(phoneNumber, targetCountry);
    // console.log('isValidPhoneNumber ', _isValidPhoneNumber);

    if (!_isValidPhoneNumber) {
      return res.json({ status: 400, Details: 'Invalid PhoneNumber' });
    }

    if (_isValidPhoneNumber) {
      const userMSISDN = await validateMSISDN(phoneNumber, targetCountry);

      const userId = await getUserId(userMSISDN);
      // console.log('UserId: ', userId);
      const userstatusresult = await checkIfSenderExists(userId);
      if (!userstatusresult) {
        // console.log('User does not exist: ');
        return res.json({ status: 400, desc: 'User does not exist' });
      }

      const isKyced = await checkisUserKyced(userId);
      if (isKyced) {
        return res.json({ status: 400, desc: 'KYC Document already exists' });
      }
      const newUserPin = await getPinFromUser();
      // console.log('newUserPin', newUserPin);
      const enc_loginpin = await createcypher(newUserPin, userMSISDN, iv);
      const userdata = {
        displayName: `${kycReqData.fullname}`,
        disabled: false,
      };
      const program = kycReqData.programName;
      await admin.auth().updateUser(userId, userdata);
      await admin
        .auth()
        .setCustomUserClaims(userId, {
          verifieduser: true,
          country: targetCountry,
          [program]: true,
        });
      // console.log('User has been verified');
      await firestore
        .collection('hashfiles')
        .doc(userId)
        .set({ enc_pin: `${enc_loginpin}` });
      await addUserKycToDB(userId, kycReqData);
      res.json({ status: 201, desc: 'KYC completed successfully' });
    }
  } catch (e) {
    res.json({ status: 400, desc: 'invalid information provided' });
  }
};

export const programsKycUpdateUser = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const { permissionLevel } = req.user;
    if (permissionLevel !== 'partner' && permissionLevel !== 'support') {
      return res.status(401).send({ status: 'Unauthorized' });
    }
    const targetCountry = getTargetCountry(
      permissionLevel,
      req.user.targetCountry
    );

    const kycReqData = req.body;

    const _isValidPhoneNumber = isValidPhoneNumber(phoneNumber, targetCountry);

    if (_isValidPhoneNumber) {
      const userMSISDN = await validateMSISDN(phoneNumber, targetCountry);
      const userId = await getUserId(userMSISDN);
      const userstatusresult = await checkIfSenderExists(userId);
      if (!userstatusresult) {
        return res.json({ status: 400, desc: 'User does not exist' });
      }

      const isKyced = await checkisUserKyced(userId);
      // If Already KYC'd
      if (isKyced) {
        return res.json({
          status: 'active',
          Comment: 'KYC Document already exists',
        });
      }

      const newUserPin = await getPinFromUser();
      // console.log('newUserPin', newUserPin);
      const enc_loginpin = await createcypher(newUserPin, userMSISDN, iv);
      const userdata = {
        displayName: `${kycReqData.fullname}`,
        disabled: false,
      };
      const program = kycReqData.programName;
      // console.log(`programName: ${program}`);
      if (program === invalid || program === null) {
        return res.json({ status: 400, desc: 'invalid programId' });
      }
      await admin.auth().updateUser(userId, userdata);
      await admin
        .auth()
        .setCustomUserClaims(userId, { verifieduser: true, [program]: true });
      // console.log('User has been verified');
      await firestore
        .collection('hashfiles')
        .doc(userId)
        .set({ enc_pin: `${enc_loginpin}` });
      await addUserKycToDB(userId, kycReqData);
      res.json({ status: 201, desc: 'KYC completed successfully' });
    }
  } catch (e) {
    res.json({ status: 400, desc: 'invalid information provided' });
  }
};
