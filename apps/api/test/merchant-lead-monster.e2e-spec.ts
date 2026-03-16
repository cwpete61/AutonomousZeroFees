import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
process.env.MERCHANT_LEAD_MONSTER_ENABLED = "true";
process.env.MLM_ENABLED = "true";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";

import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/modules/prisma/prisma.service";
import { StripeService } from "../src/modules/billing/stripe.service";
import { RedisEventBus } from "@agency/events";

describe("Merchant Lead Monster (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        merchantLeadMonsterCalculatorSession: {
          create: jest.fn().mockResolvedValue({
            id: "cs_1",
            targetRateBps: 220,
            monthlyFeesCurrentCents: 145_000n,
            monthlyFeesTargetCents: 110_000n,
            monthlySavingsCents: 35_000n,
            annualSavingsCents: 420_000n,
          }),
          findUnique: jest.fn().mockResolvedValue({
            id: "cs_1",
            targetRateBps: 220,
            monthlyFeesCurrentCents: 145_000n,
            monthlyFeesTargetCents: 110_000n,
            monthlySavingsCents: 35_000n,
            annualSavingsCents: 420_000n,
          }),
        },
        merchantLeadMonsterAppointment: {
          create: jest
            .fn()
            .mockResolvedValue({ id: "ap_1", status: "REQUESTED" }),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({}),
        },
      })
      .overrideProvider(StripeService)
      .useValue({ stripe: {} })
      .overrideProvider(RedisEventBus)
      .useValue({ publish: jest.fn().mockResolvedValue(true) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("POST /merchant-lead-monster/calculator/sessions returns computed USD strings", async () => {
    await request(app.getHttpServer())
      .post("/merchant-lead-monster/calculator/sessions")
      .send({ monthlyVolumeUsd: "50000.00", currentRatePct: "2.9" })
      .expect(201)
      .expect((res) => {
        expect(res.body.monthlySavingsUsd).toBe("350.00");
      });
  });
});
