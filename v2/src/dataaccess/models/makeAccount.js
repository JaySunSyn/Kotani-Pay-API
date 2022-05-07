const makeAccount = ({ id, publicKey, privateKey }) => {
  if (!id || !publicKey || !privateKey) {
    throw new Error('Missing account Info');
  }

  return Object.freeze({
    id,
    publicKey,
    privateKey
  });
};
