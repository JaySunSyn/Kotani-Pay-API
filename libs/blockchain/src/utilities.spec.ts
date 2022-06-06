import {
  getPublicAddress,
  getEncryptKey,
  createcypher,
} from '@kotanicore/blockchain/utilities';

describe('Utilitis', () => {
  describe('getPublicAddress', () => {
    it('Should return the Appropriate PUblic Key', () => {
      expect(getPublicAddress('')).toBe('');
    });
  });

  describe('getEncryptKEy', () => {
    it('Should return the Correct address', () => {
      expect(getEncryptKey('')).toBe('');
    });
  });

  describe('createcypher', () => {
    it('Should return Correct Cypher', () => {
      expect(createcypher('', '', '')).toBe('');
    });
  });
});
