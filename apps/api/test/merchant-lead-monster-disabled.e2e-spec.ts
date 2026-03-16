import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
delete process.env.MERCHANT_LEAD_MONSTER_ENABLED;
delete process.env.MLM_ENABLED;
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";

import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/modules/prisma/prisma.service";
import { StripeService } from "../src/modules/billing/stripe.service";

describe("Merchant Lead Monster (disabled) (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(StripeService)
      .useValue({ stripe: {} })
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

  it("returns 404 for Merchant Lead Monster routes when disabled", async () => {
    await request(app.getHttpServer())
      .post("/merchant-lead-monster/calculator/sessions")
      .send({ monthlyVolumeUsd: "50000.00", currentRatePct: "2.9" })
      .expect(404);

    await request(app.getHttpServer())
      .get("/merchant-lead-monster/calculator/sessions/cs_1")
      .expect(404);

    await request(app.getHttpServer())
      .post("/merchant-lead-monster/appointments")
      .send({
        calculatorSessionId: "cs_1",
        name: "A",
        email: "a@b.com",
        businessName: "Biz",
      })
      .expect(404);
  });
});
