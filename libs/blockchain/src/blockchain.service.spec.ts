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
    it('Should return ', () => {
      expect(service.getUserId('')).toBe('');
    });
  });

  describe('retreiveCusdBalance', () => {
    it('SHouldd retreive correct balance given the address', () => {
      expect(service.retreiveCusdBalance('address')).toBe('');
    });
  });
});
