const { countries, generatepin, getAirtelClient } = require('../util');
const { generateReferenceCode } = require('../../../../../modules/jengakit');

const { verifyAmount } = require('../util');

const disburseUrl = '/standard/v1/disbursements/';

export const airtelDisburse = async (country, amount, msisdn) => {
  const countryInfo = countries[country];

  if (!countryInfo) {
    throw new Error(' country errors');
  }

  const verifiredAmount = verifyAmount(amount);

  const genPin = generatepin();
  const uId = generateReferenceCode();

  const headers = {
    'X-Country': countryInfo.cc,
    'X-Currency': countryInfo.currency,
  };

  // Todo: generate a Reference Key store for this
  const body = {
    payee: {
      msisdn,
    },

    reference: 'ABCD07026984141',
    pin: genPin,
    transaction: {
      amount: verifiredAmount,
      id: uId,
    },
  };

  try {
    const client = await getAirtelClient();
    const result = await client.post(disburseUrl, body, { headers });
    return result;
  } catch (e) {
    // Log or send error
    throw new Error('Something went wrong');
  }
};

export default { airtelDisburse };
