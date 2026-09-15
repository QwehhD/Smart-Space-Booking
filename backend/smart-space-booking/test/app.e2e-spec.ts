import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { pasangGlobalPrefix } from './../src/common/app-prefix';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        isHealthy: jest.fn().mockResolvedValue(true),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    pasangGlobalPrefix(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / mengembalikan informasi API dalam amplop response standar', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);

    expect(response.body).toMatchObject({
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan',
      data: { status: 'online', swagger_docs: '/docs' },
    });
    expect(response.body.timestamp).toEqual(expect.any(String));
  });

  it('GET /health melaporkan koneksi database', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body.data).toMatchObject({
      status: 'ok',
      database: 'connected',
    });
  });

  it('endpoint yang tidak dikenal dibalas dengan format error standar', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/tidak-ada')
      .expect(404);

    expect(response.body).toMatchObject({
      status: false,
      statusCode: 404,
      error: 'Not Found',
    });
  });
});
