import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

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
      .expect('Hi from  Kotani OpenSource');
  });

  it('/CreateUser  (Post)', () => {
    return request(app.getHttpServer())
      .post('/create')
      .expect(201)
      .expect('Hi from  Kotani OpenSource');
  });

  it('/set KYC  (Post)', () => {
    return request(app.getHttpServer())
      .post('/kyc')
      .expect(201)
      .expect('Hi from  Kotani OpenSource');
  });

  it('/Get Balance  (GEt)', () => {
    return request(app.getHttpServer())
      .get('/balance')
      .expect(200)
      .expect('Hi from  Kotani OpenSource');
  });
});
