import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: { get: () => 'http://localhost:3000' },
        },
        {
          provide: PrismaService,
          useValue: { isHealthy: () => Promise.resolve(true) },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('mengembalikan informasi API beserta tautan dokumentasi', () => {
    const info = appController.getApiInfo();

    expect(info.status).toBe('online');
    expect(info.documentation_links.swagger).toBe('http://localhost:3000/docs');
  });

  it('mengembalikan status sehat ketika database terhubung', async () => {
    await expect(appController.getHealth()).resolves.toMatchObject({
      status: 'ok',
      database: 'connected',
    });
  });
});
