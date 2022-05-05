const USD_TO_KES = '3128952f1782f60c1cf95c5c3d13b4dc739f1a0d';
const KES_TO_USD = '883736ecb6bd36d6411c77bdf1351052a1f23c00';
const { iv } = process.env;
const { escrowMSISDN } = process.env;
const { jenga_username } = process.env;
const { jenga_password } = process.env;
const { jenga_api_key } = process.env;
const merchant_code = process.env.jenga_merchant_code;
const account_id = process.env.jenga_api_key;
const { jenga_base_api_url } = process.env;
const AT_APIKEY = process.env.at_apikey;
const AT_USERNAME = process.env.at_username;
const { enc_decr_fn } = process.env;
const { phone_hash_fn } = process.env;
const { account } = process.env;



module.exports = {
  USD_TO_KES,
  KES_TO_USD,
  iv,
  escrowMSISDN,
  jenga_username,
  jenga_password,
  jenga_api_key,
  merchant_code,
  account_id,
  jenga_base_api_url,
  AT_APIKEY,
  AT_USERNAME,
  enc_decr_fn,
  phone_hash_fn,
  account

};
