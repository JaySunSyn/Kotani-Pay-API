import { Test, TestingModule } from '@nestjs/testing';
import { CoreService } from './core.service';
import { RepositoryModule, RepositoryService } from '@kotanicore/repository';
import { BlockchainService } from '@kotanicore/blockchain';

describe('CoreService', () => {
  let service: CoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RepositoryModule],
      providers: [CoreService, BlockchainService],
      exports: [BlockchainService],
    }).compile();

    service = module.get<CoreService>(CoreService);
  });

  describe('Create User ', () => {
    it('Should be defined ', () => {
      expect(service.createUser).toBeDefined();
    });

    it('Should add User ', () => {
      expect(
        service.createUser({
          phoneNumber: '+254722123456',
          name: 'ELijah',
          email: 'ej@gmail.com',
        }),
      ).toBeDefined();
    });
  });

  describe('Get-Balance', () => {
    it('Should be defined', () => {
      expect(service.getBalance).toBeDefined();
    });

    it('Should fetch balance', () => {
      expect(service.getBalance('')).toBeDefined();
    });
  });

  describe('Set -KYC', () => {
    it('Should be definedd', () => {
      expect(service.setUserKyc).toBeDefined();
    });

    it('Should add KYC', () => {
      expect(
        service.setUserKyc(
          {
            documentNumber: '',
            dateOfBirth: '',
            documentType: '',
          },
          '',
        ),
      ).toBeDefined();
    });
  });
});
