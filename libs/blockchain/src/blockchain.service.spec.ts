import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService } from './blockchain.service';
import exp from 'constants';

describe('BlockchainService', () => {
  let service: BlockchainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainService],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserId', () => {
    it('Should return a user Id Generated  ', async () => {
      await expect(service.getUserId('254726123456')).resolves.toBe(
        'c91f4bcda3586f533ee6fcd0ff791759b6cb614f',
      );
    });
  });

  //Todo: Resolve by figuring out how to run Celo in TestNet during local and test Enviroment
  // describe('retreiveCusdBalance', () => {
  //   it('Should retrieve correct balance given the address', async () => {
  //     await expect(service.retreiveCusdBalance('address')).resolves.toBe('');
  //   });
  // });

  describe('createAccountInfo', () => {
    it('Should Generate a Memonic', async () => {
      const res = await service.createMnemonic();
      expect(typeof res).toEqual(`string`);
    });

    it('Should Account  details', async () => {
      await expect(
        service.createAccountInfo('254726123456', 'mnemonic'),
      ).resolves.toStrictEqual({
        publicAddress: '0xe58c97DC16485E750777661BA03E17D613705509',
        seedKey: '5c89abb662c8506910e0b734c6ce1971',
      });
    });
  });
});
