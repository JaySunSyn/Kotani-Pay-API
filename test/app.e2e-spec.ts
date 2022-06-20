import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hi from  Kotani Open Source!');
  });

  describe('/CreateUser', () => {
    it(' Should NOT CreateUser if no data is provided', () => {
      return request(app.getHttpServer()).post('/create').expect(400);
    });
  });

  describe('/set KYC', () => {
    it('Should NOT set  if not authorized ', () => {
      return request(app.getHttpServer()).post('/kyc').expect(401);
    });
  });

  describe('/Get Balance  (GEt)', () => {
    it('Should NOT fetch if unaothrzed', () => {
      return request(app.getHttpServer()).get('/balance').expect(401);
    });
  });
});
