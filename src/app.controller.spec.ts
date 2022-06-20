import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreService } from '@kotanicore/services';
import { Promise } from 'mongoose';
import { AuthService } from '@kotanicore/auth';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: CoreService,
          useValue: {
            getBalance: jest.fn().mockImplementation(() =>
              Promise.resolve({
                success: true,
                balance: 2.78,
              }),
            ),
            initiateWithdrawal: jest
              .fn()
              .mockImplementation(() => Promise.resolve({})),
            setUserKyc: jest
              .fn()
              .mockImplementation(() => Promise.resolve({ success: true })),
            createUser: jest.fn().mockImplementation(() =>
              Promise.resolve({
                id: 'xx',
                email: 'Ej@gmail.com',
                name: 'Ej',
                phoneNumber: '2547123456',
              }),
            ),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateUser: jest
              .fn()
              .mockImplementation(() => Promise.resolve({})),
            login: jest
              .fn()
              .mockImplementation(() =>
                Promise.resolve({ token: 'testToken' }),
              ),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root Controller', () => {
    it('should return "\'Hi from  Kotani OpenSource \'"', () => {
      expect(appController.getHello()).toBe('Hi from  Kotani Open Source!');
    });
  });

  describe('Login', () => {
    it('should return access token ', async () => {
      await expect(
        appController.login({
          password: '',
          phone: '',
        }),
      ).resolves.toStrictEqual({ token: 'testToken' });
    });
  });

  describe('get-balance', () => {
    it('Should return success if provided with phone"', async () => {
      await expect(
        appController.getBalance({
          phoneNumber: '254726123456',
        }),
      ).resolves.toEqual({
        success: true,
        balance: 2.78,
      });
    });
  });

  describe('set-kyc', () => {
    it('should return user kyc data ', async () => {
      await expect(
        appController.addUserKyc({
          dateOfBirth: '',
          documentNumber: '12223344',
          documentType: 'PassPort',
        }),
      ).resolves.toStrictEqual({
        success: true,
      });
    });
  });

  describe('create-user', () => {
    it('should return create User if data is clean', async () => {
      await expect(
        appController.createUser({
          email: 'Ej@gmail.com',
          name: 'Ej',
          phoneNumber: '2547123456',
          password: 'password',
        }),
      ).resolves.toStrictEqual({
        id: 'xx',
        email: 'Ej@gmail.com',
        name: 'Ej',
        phoneNumber: '2547123456',
      });
    });
  });
});
