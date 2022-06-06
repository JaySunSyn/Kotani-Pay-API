import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreService } from '@kotanicore/services';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockResolvedValue('Hi from  Kotani OpenSource'),
          },
        },
        {
          provide: CoreService,
          useValue: {
            getBalance: jest.fn().mockResolvedValue([]),
            initiateWithdrawal: jest
              .fn()
              .mockImplementation(() => Promise.resolve({})),
            addUserKyc: jest.fn().mockImplementation(() => Promise.resolve({})),
            createUser: jest.fn().mockImplementation(() => Promise.resolve({})),
            login: jest.fn().mockImplementation(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root Controller', () => {
    it('should return "\'Hi from  Kotani OpenSource \'"', () => {
      expect(appController.getHello()).toBe('Hi from  Kotani OpenSource');
    });
  });

  describe('get-balance', () => {
    it('should return "Hello World!"', () => {
      expect(
        appController.getBalance({
          phoneNumber: '',
        }),
      ).toBe('Hello World!');
    });

    it('should return Balance if authenticated"', () => {
      expect(
        appController.getBalance({
          phoneNumber: '',
        }),
      ).toBe('Hello World!');
    });

    it('should throw unauthorised exception if user ot authenticated', () => {
      expect(
        appController.getBalance({
          phoneNumber: '',
        }),
      ).toBe('Hello World!');
    });
  });

  describe('set-kyc', () => {
    it('should return user kyc data ', () => {
      expect(
        appController.addUserKyc({
          dateOfBirth: '',
          documentNumber: '12223344',
          documentType: 'PassPort',
        }),
      ).toBe('Hello World!');
    });

    it('should throw error if Input data is wrong ', () => {
      expect(
        appController.addUserKyc({
          dateOfBirth: '',
          documentNumber: '12223344',
          documentType: 'PassPort',
        }),
      ).toBe('Hello World!');
    });
  });

  describe('create-user', () => {
    it('should return create User if data is clean', () => {
      expect(
        appController.createUser({
          email: 'Ej@gmail.com',
          name: 'Ej',
          phoneNumber: '2547123456',
        }),
      ).toBe('Hello World!');
    });

    it('should not create user with bad input ', () => {
      expect(
        appController.createUser({
          email: 'Email',
          name: '',
          phoneNumber: '1111111111',
        }),
      ).toThrowError();
    });
  });
});
