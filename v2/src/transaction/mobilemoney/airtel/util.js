const axios = require('axios');

export const countries = {
  UGANDA: {
    cc: 'UG',
    currency: 'UGX',
  },
  KENYA: {
    cc: 'KE',
    currency: 'KES',
  },
  TANZANIA: {
    cc: 'TZ',
    currency: 'TZS',
  },
};

export const getOathToken = async () => axios.post('https://openapi.airtel.africa/auth/oauth2/token');

export const verifyAmount = (amount) => {
  // Any verification for Airtel amount goess here
  if (Number.isSafeInteger(amount) && amount <= 0) {
    return amount;
  }
  throw new Error('Something is up with the amount');
};

export const getAirtelClient = async () => {
  try {
    const { accessToken } = getOathToken();

    return await axios.create({
      baseURL: 'https://openapi.airtel.africa/',
      timeout: 1000,
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (e) {
    throw new Error(e);
  }
};

export const generatepin = async () =>
  // Todo: encrpyt
  'KYJExln8rZwb14G1K5UE5YF/lD7KheNUM171MUEG3/f/QD8nmNKRsa44';

export default {
  countries,
  getOathToken,
  verifyAmount,
  generatepin,
};
