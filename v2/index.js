require('dotenv').config();

// Firebase init
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');
const {
  kycUserCreate,
} = require('./src/kyc/index');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://ENV_DB_URL.firebaseio.com',
  });
} catch (err) {
  admin.app();
}

const api_v2 = require('./api_v2');

const fromCore = () => {
  console.log('retreived from core');
};

module.exports = {
  fromCore,
  kycUserCreate
};

exports.api_v2 = functions.https.onRequest(api_v2);
