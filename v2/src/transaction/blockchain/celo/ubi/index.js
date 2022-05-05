const moment = require('moment');
const { getUserId, getUserDetails, getTargetCountry } = require('../../../../../modules/libraries');
const lib = require('../../../../../modules/libraries');

const { getTxidUrl, isValidPhoneNumber, validateMSISDN } = require('../../../../../modules/utilities');
// GLOBAL ENV VARIABLES
const { iv, signerMSISDN } = require('../../../../contants');
const {
  checkIfBeneficiary, addBeneficiary, checkUbiScBalance, sendUBIClaim,
} = require('../../../../../modules/celokit');

// 👍🏽
export const transactionUbiClaimFunds = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const PROGRAM_NAME = req.body.programId;
    const { permissionLevel } = req.user;
    const targetCountry = getTargetCountry(permissionLevel, req.user.targetCountry);

    const senderMSISDN = await validateMSISDN(phoneNumber, targetCountry);
    const _isValidPhoneNumber = await isValidPhoneNumber(senderMSISDN, targetCountry);
    if (!_isValidPhoneNumber) { return res.json({ status: 400, desc: `${senderMSISDN} is not a valid phoneNumber` }); }

    const senderId = await getUserId(senderMSISDN);
    const isverified = await lib.checkIfUserisVerified(senderId);
    if (!isverified) { return res.json({ status: 400, desc: 'user account is not verified' }); }

    const senderInfo = await getUserDetails(senderId);
    const senderAddress = senderInfo.data().publicAddress;

    const programId = await getUserId(PROGRAM_NAME);
    let UBISCADDRESS = '';
    if (targetCountry === 'KE' && programId === 'f97de62a9424cc14113f997adeee0fdcdc9c7694') { UBISCADDRESS = '0x667973de162C7032e816041a1Eef42261901EbE3'; } // KAKUMA CAMP
    if (targetCountry === 'KE' && programId === '29b0e54c8f30b578b4fb4368eb3bf9f20a184098') { UBISCADDRESS = '0x27A9f905481D666A51148A4b43Ad4254cf105103'; } // KOWITI CAMP
    if (targetCountry === 'KE' && programId === '4d7ff8780825d44d9031c1d9082c7248459fc6c1') { UBISCADDRESS = '0xa4046EBD28E9c231284F26325F843a8eEd44687D'; } // ORAM CAMP
    if (targetCountry === 'GH' && programId === 'daad568c68bf176607dff3214e0187d97af5923f') { UBISCADDRESS = '0x667973de162C7032e816041a1Eef42261901EbE3'; } // KRISHAN CAMP
    if (targetCountry === 'GH' && programId === '28f994aaa868eb04ee51d93ba4ded9ffd753dfc6') { UBISCADDRESS = '0x23091cb65b79235aba66b9cecd49ca005ea7d4e7'; } // MTN-WELFARE CAMP

    const ubiapprovedstatus = await checkIfBeneficiary(senderAddress, UBISCADDRESS);
    console.log('Beneficiary Status: ', ubiapprovedstatus); // checkIfBeneficiary
    if (ubiapprovedstatus !== 1) {
      console.log(`${senderMSISDN} Approval status is: ${ubiapprovedstatus}`);
      return res.json({ status: 400, desc: 'You\'re not approved to access this service' });
    }

    const ubiScBalance = await checkUbiScBalance(UBISCADDRESS);
    console.log('UBI SC Balance: ', ubiScBalance); // checkUbiScBalance
    if (ubiScBalance < 2) { return res.json({ status: 400, desc: 'Insufficient funds in the UBI account. \nPlease try again later' }); }

    // Retrieve User Blockchain Data
    const senderprivkey = await lib.getSenderPrivateKey(senderInfo.data().seedKey, senderMSISDN, iv);

    const receipt = await sendUBIClaim(senderAddress, senderprivkey, UBISCADDRESS);
    console.log('Indexjs_UBI Claim response: ', JSON.stringify(receipt));

    if (receipt === 'failed' || receipt === 'invalid') { return res.json({ status: 400, desc: 'Unable to process your UBI claim' }); }

    if (receipt.status === 'NOT_YET') {
      const unixTimestamp = parseInt(receipt.claimTime, 10);
      const claimTime = moment.unix(unixTimestamp).format('YYYY-MM-DD, HH:mm:ss');
      return res.json({ status: 400, desc: `Unable to process your UBI claim, Its not yet time, Retry claim after: ${claimTime}` });
    }

    const url = await getTxidUrl(receipt.transactionHash);
    console.log('UBI Claim tx URL', url);
    res.json({ status: 201, desc: 'Your UBI Claim Request was successful.', txid: url });
  } catch (e) { console.log(e); res.json({ status: 400, desc: 'Invalid request' }); }
};

export const transactionUbiCheckBeneficiary = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const PROGRAM_NAME = req.body.programId;
    const { permissionLevel } = req.user;
    const targetCountry = getTargetCountry(permissionLevel, req.user.targetCountry);
    // if(targetCountry != "KE") {return res.json({ "status" : 400, "desc" : `Invalid request` })}

    const senderMSISDN = await validateMSISDN(phoneNumber, targetCountry);
    const _isValidPhoneNumber = await isValidPhoneNumber(senderMSISDN, targetCountry);
    if (!_isValidPhoneNumber) { return res.json({ status: 400, desc: `${senderMSISDN} is not a valid phoneNumber` }); }

    const senderId = await getUserId(senderMSISDN);
    const isverified = await lib.checkIfUserisVerified(senderId);
    if (!isverified) { return res.json({ status: 400, desc: 'user account is not verified' }); }

    const senderInfo = await getUserDetails(senderId);
    const senderAddress = senderInfo.data().publicAddress;
    // if(req.user.phoneNumber == "+233249993319"){programId == 'mtn-insurance'};

    const programId = await getUserId(PROGRAM_NAME);
    let UBISCADDRESS = '';
    if (targetCountry === 'KE' && programId === 'f97de62a9424cc14113f997adeee0fdcdc9c7694') { UBISCADDRESS = '0x667973de162C7032e816041a1Eef42261901EbE3'; } // KAKUMA CAMP
    if (targetCountry === 'KE' && programId === '29b0e54c8f30b578b4fb4368eb3bf9f20a184098') { UBISCADDRESS = '0x27A9f905481D666A51148A4b43Ad4254cf105103'; } // KOWITI CAMP
    if (targetCountry === 'KE' && programId === '4d7ff8780825d44d9031c1d9082c7248459fc6c1') { UBISCADDRESS = '0xa4046EBD28E9c231284F26325F843a8eEd44687D'; } // ORAM CAMP
    if (targetCountry === 'GH' && programId === 'daad568c68bf176607dff3214e0187d97af5923f') { UBISCADDRESS = '0x667973de162C7032e816041a1Eef42261901EbE3'; } // KRISHAN CAMP
    if (targetCountry === 'GH' && programId === '28f994aaa868eb04ee51d93ba4ded9ffd753dfc6') { UBISCADDRESS = '0x23091cb65b79235aba66b9cecd49ca005ea7d4e7'; } // MTN-WELFARE CAMP

    const ubiapprovedstatus = await checkIfBeneficiary(senderAddress, UBISCADDRESS);
    console.log('Beneficiary Status: ', ubiapprovedstatus); // checkIfBeneficiary
    if (ubiapprovedstatus !== 1) { return res.json({ status: 400, desc: 'Not a beneficiary' }); }
    if (ubiapprovedstatus === 1) { return res.json({ status: 201, desc: 'User is a beneficiary' }); }
  } catch (e) { console.log(e); res.json({ status: 400, desc: 'Invalid request' }); }
};

// eslint-disable-next-line consistent-return
export const transactionUbiSetBeneficiary = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const PROGRAM_NAME = req.body.programId;
    const targetCountry = getTargetCountry(req.user.permissionLevel, req.user.targetCountry);
    const senderMSISDN = await validateMSISDN(phoneNumber, targetCountry);
    const _isValidPhoneNumber = await isValidPhoneNumber(senderMSISDN, targetCountry);
    if (!_isValidPhoneNumber) { return res.json({ status: 400, desc: `${senderMSISDN} is not a valid phoneNumber` }); }

    const senderId = await getUserId(senderMSISDN);
    const isverified = await lib.checkIfUserisVerified(senderId);
    if (!isverified) { return res.json({ status: 400, desc: 'user account is not verified' }); }

    const senderInfo = await getUserDetails(senderId);
    const senderAddress = senderInfo.data().publicAddress;
    const signerNumber = req.user.phoneNumber;
    const programId = await getUserId(PROGRAM_NAME);

    let UBISCADDRESS = '';
    if (programId !== 'f97de62a9424cc14113f997adeee0fdcdc9c7694' && programId !== '29b0e54c8f30b578b4fb4368eb3bf9f20a184098' && dprogramId !== '4d7ff8780825d44d9031c1d9082c7248459fc6c1' && programId !== 'daad568c68bf176607dff3214e0187d97af5923f' && programId !== '28f994aaa868eb04ee51d93ba4ded9ffd753dfc6') { return res.json({ status: 400, desc: 'invalid UBI' }); }
    if (targetCountry === 'KE' && programId === 'f97de62a9424cc14113f997adeee0fdcdc9c7694') { UBISCADDRESS = '0x667973de162C7032e816041a1Eef42261901EbE3'; } // KAKUMA CAMP
    if (targetCountry === 'KE' && programId === '29b0e54c8f30b578b4fb4368eb3bf9f20a184098') { UBISCADDRESS = '0x27A9f905481D666A51148A4b43Ad4254cf105103'; } // KOWITI CAMP
    if (targetCountry === 'KE' && programId === '4d7ff8780825d44d9031c1d9082c7248459fc6c1') { UBISCADDRESS = '0xa4046EBD28E9c231284F26325F843a8eEd44687D'; } // ORAM CAMP
    if (targetCountry === 'GH' && programId === 'daad568c68bf176607dff3214e0187d97af5923f') { UBISCADDRESS = '0x667973de162C7032e816041a1Eef42261901EbE3'; } // KRISHAN CAMP
    if (targetCountry === 'GH' && programId === '28f994aaa868eb04ee51d93ba4ded9ffd753dfc6') { UBISCADDRESS = '0x23091cb65b79235aba66b9cecd49ca005ea7d4e7'; } // MTN-WELFARE CAMP ##NOT A SC

    const ubiapprovedstatus = await checkIfBeneficiary(senderAddress, UBISCADDRESS);
    if (ubiapprovedstatus === 1) { return res.json({ status: 400, desc: 'User is already a beneficiary' }); }

    const signerInfo = getUserDetails(await getUserId(signerMSISDN));
    const signerAddress = signerInfo.data().publicAddress;
    const signerPrivKey = await lib.getSenderPrivateKey(signerAddress.data().seedKey, signerMSISDN, iv);
    const result = await addBeneficiary(signerAddress, senderAddress, signerPrivKey, UBISCADDRESS);
    console.log(result);
    return res.json({ status: 201, desc: 'User added as a beneficiary', result });
  } catch (e) { console.log(e); res.json({ status: 400, desc: 'Invalid request' }); }
};
