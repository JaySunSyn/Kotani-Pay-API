const makeAuth = ({ phoneNumber }, makeUid) => {
  if (!phoneNumber) {
    throw new Error(' Missing Phonenumber');
  }
  // phonenumber :  string //316 4 format
  // uid : unique 12 string char
  const uid = makeUid(phoneNumber);

  return Object.freeze({
    phonenumber: phoneNumber,
    uid
  });
};
