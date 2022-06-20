import {
  getPublicAddress,
  getEncryptKey,
  createcypher,
} from '@kotanicore/blockchain/utilities';

describe('Utilities', () => {
  describe('getPublicAddress', () => {
    it('Should return the Appropriate Public Key', async () => {
      await expect(getPublicAddress('MyMmemonicText')).resolves.toBe(
        '0x7F7153e01dDcaBA0017E056f89638A2E19165550',
      );
    });
  });

  describe('getEncryptKEy', () => {
    it('Should return the Correct address', () => {
      expect(getEncryptKey('254726123456')).toBe(
        '4154e43466c05bab1136ce19114a55fbb5f3ac413681d9b3be83a9a37109578f',
      );
    });
  });

  describe('create-cypher', () => {
    it('Should return Correct Cypher', async () => {
      await expect(
        createcypher('Text', '254726123456', 'sha256'),
      ).resolves.toBe('aae5706e65018ae8eec0555d82cdd17e');
    });
  });
});
