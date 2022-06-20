import { Test, TestingModule } from '@nestjs/testing';
import { BaseMongoRepository } from '@kotanicore/repo-orm';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import {
  AccountDocumentInterface,
  AccountInterface,
  KycDocumentInterface,
  KycInterface,
  UserDocumentInterface,
  UserInterface,
} from '@kotanicore/repository';

const mockUser = (): UserInterface => ({
  id: '',
  email: 'es@df.dd',
  name: 'sd',
  phoneNumber: '254726123456',
  password: '123344',
});
const mockUserDoc = (): Partial<UserDocumentInterface> => ({
  id: '',
  email: 'es@df.dd',
  name: 'sd',
  phoneNumber: '254726123456',
  password: '123344',
});

const mockAccount = (): AccountInterface => ({
  id: 'xx',
  seedKey: 'sk',
  publicAddress: 'pA',
});
const mockAccountDoc = (): Partial<AccountDocumentInterface> => ({});

const mockKyc = (): KycInterface => ({
  dateOfBirth: '',
  documentNumber: '',
  documentType: '',
});
const mockKycDoc = (): Partial<KycDocumentInterface> => ({});

describe('Base Mongo Repository', () => {
  let baseMongoRepository: BaseMongoRepository;
  let userModel: Model<UserDocumentInterface>;
  let accountModel: Model<AccountDocumentInterface>;
  let kycModel: Model<KycDocumentInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BaseMongoRepository,
        {
          provide: getModelToken('user'),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken('accounts'),
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken('kycdata'),
          useValue: {
            exists: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    baseMongoRepository = module.get(BaseMongoRepository);
    userModel = module.get(getModelToken('user'));
    accountModel = module.get(getModelToken('accounts'));
    kycModel = module.get(getModelToken('kycdata'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should checkIfUserExists', async () => {
    jest.spyOn(userModel, 'findOne').mockReturnValue(
      createMock({
        exec: jest.fn().mockResolvedValueOnce(mockUserDoc()),
      }) as any,
    );
    const userFound = await baseMongoRepository.checkIfUserExists(
      '254726123456',
    );
    const userExpect = mockUser();
    expect(userFound).toEqual(userExpect);
  });

  it('should createUser', async () => {
    jest
      .spyOn(userModel, 'create')
      .mockImplementation(() => Promise.resolve(mockUser()));

    const userFound = await baseMongoRepository.createUser(mockUser());

    expect(userFound).toEqual({
      email: 'es@df.dd',
      name: 'sd',
      phoneNumber: '254726123456',
    });
  });

  //Todo: Fix Id issue
  // it('should checkisUserKyced', async () => {
  //   jest.spyOn(kycModel, 'exists').mockReturnValue(
  //     createMock({
  //       exec: jest.fn().mockResolvedValueOnce(mockKycDoc()),
  //     }) as any,
  //   );
  //   const kycFound = await baseMongoRepository.checkisUserKyced('');
  //   const kycExpect = mockKyc();
  //   expect(kycFound).toEqual(kycExpect);
  // });

  it('should setUserKyc', async () => {
    jest
      .spyOn(kycModel, 'create')
      .mockImplementation(() => Promise.resolve(mockKyc()));
    const kycFound = await baseMongoRepository.setUserKyc('userId');
    expect(kycFound).toEqual({
      dateOfBirth: '',
      documentNumber: '',
      documentType: '',
    });
  });

  it('should createAccount', async () => {
    jest
      .spyOn(accountModel, 'create')
      .mockImplementation(() => Promise.resolve(mockAccount()));
    const accFound = await baseMongoRepository.createAccount(mockAccount());
    expect(accFound).toEqual({
      id: 'xx',
      publicAddress: 'pA',
      seedKey: 'sk',
    });
  });

  //Todo: find by Id
  // it('should getAccountInfo', async () => {
  //   jest.spyOn(accountModel, 'findById').mockReturnValue(
  //     createMock({
  //       exec: jest.fn().mockResolvedValueOnce(mockAccountDoc()),
  //     }) as any,
  //   );
  //   const accFound = await baseMongoRepository.getAccountInfo(mockAccount());
  //   const accExpect = mockAccount();
  //   expect(accFound).toEqual(accExpect);
  // });
});
