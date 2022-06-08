import { Test, TestingModule } from '@nestjs/testing';
import { CoreService } from './core.service';

describe('CoreService', () => {
  let service: CoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [],
      exports: [],
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
          password: '',
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
