import { Test, TestingModule } from '@nestjs/testing';
import { CoreService } from './core.service';
import { BlockchainService } from '@kotanicore/blockchain';
import { RepositoryService } from '@kotanicore/repository';

describe('CoreService', () => {
  let service: CoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        CoreService,
        {
          provide: BlockchainService,
          useValue: {
            retreiveCusdBalance: jest
              .fn()
              .mockImplementation(() => Promise.resolve(20.34)),
          },
        },
        {
          provide: RepositoryService,
          useValue: {
            checkisUserKyced: jest
              .fn()
              .mockImplementation(() => Promise.resolve({})),
            checkIfUserExists: jest
              .fn()
              .mockImplementation(() => Promise.resolve({})),
            getAccountInfo: jest.fn().mockImplementation(() =>
              Promise.resolve({
                account: {
                  publicAddress: 'publicaddress',
                },
              }),
            ),
          },
        },
      ],
      exports: [],
    }).compile();

    service = module.get<CoreService>(CoreService);
  });

  describe('Create User ', () => {
    it('Should be defined ', () => {
      expect(service.createUser).toBeDefined();
    });

    it('Should add User ', async () => {
      await expect(
        service.createUser({
          phoneNumber: '+254722123456',
          name: 'ELijah',
          email: 'ej@gmail.com',
          password: '',
        }),
      ).rejects.toThrowError('');
    });
  });

  describe('Get-Balance', () => {
    it('Should be defined', () => {
      expect(service.getBalance).toBeDefined();
    });

    it('Should fetch balance', async () => {
      await expect(service.getBalance('xccdddss')).resolves.toStrictEqual({
        balance: 20.34,
        success: true,
      });
    });
  });

  describe('Set -KYC', () => {
    it('Should be definedd', () => {
      expect(service.setUserKyc).toBeDefined();
    });

    it('Should add KYC', async () => {
      await expect(
        service.setUserKyc(
          {
            documentNumber: '2323232',
            dateOfBirth: '14-06-1850',
            documentType: 'NationalId',
          },
          'zzx',
        ),
      ).rejects.toThrowError('');
    });
  });
});
