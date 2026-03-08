import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { StripeService } from '../src/modules/billing/stripe.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';

describe('CampaignsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockCampaign = {
    id: 'camp-123',
    name: 'Test Campaign',
    status: 'ACTIVE',
    niche: 'HVAC',
    geography: 'Miami, FL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        campaign: {
          findMany: jest.fn().mockResolvedValue([mockCampaign]),
          create: jest.fn().mockResolvedValue(mockCampaign),
          findUnique: jest.fn().mockResolvedValue(mockCampaign),
          update: jest.fn().mockResolvedValue(mockCampaign),
          delete: jest.fn().mockResolvedValue(mockCampaign),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({}),
        },
      })
      .overrideProvider(StripeService)
      .useValue({
        stripe: {},
      })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/campaigns (GET)', () => {
    return request(app.getHttpServer())
      .get('/campaigns')
      .expect(200)
      .expect([mockCampaign]);
  });

  it('/campaigns (POST)', () => {
    const newCampaign = { 
      name: 'New Campaign', 
      niche: 'Plumbing',
      geography: 'Orlando, FL'
    };
    return request(app.getHttpServer())
      .post('/campaigns')
      .send(newCampaign)
      .expect(201);
  });
});
