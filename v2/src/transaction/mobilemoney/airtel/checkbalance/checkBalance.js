const { countries, getAirtelClient } = require('../util');

const getBalanceUrl = '/standard/v1/users/balance';

export const airtelCheckBalance = async (country) => {
  const countryInfo = countries[country];

  if (!countryInfo) {
    throw new Error('');
  }

  const headers = {
    'X-Country': countryInfo.cc,
    'X-Currency': countryInfo.currency,
  };

  try {
    const client = await getAirtelClient();
    return await client.get(getBalanceUrl, { headers });
  } catch (e) {
    throw new Error('Something went  wrong ');
  }
};

export default {
  airtelCheckBalance,
};
