-- CreateEnum
CREATE TYPE "MerchantLeadMonsterAppointmentStatus" AS ENUM ('REQUESTED');

-- CreateTable
CREATE TABLE "MerchantLeadMonsterCalculatorSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "monthlyVolumeCents" BIGINT NOT NULL,
    "currentRateBps" INTEGER NOT NULL,
    "targetRateBps" INTEGER NOT NULL,
    "monthlyFeesCurrentCents" BIGINT NOT NULL,
    "monthlyFeesTargetCents" BIGINT NOT NULL,
    "monthlySavingsCents" BIGINT NOT NULL,
    "annualSavingsCents" BIGINT NOT NULL,
    "utmSource" VARCHAR(200),
    "utmMedium" VARCHAR(200),
    "utmCampaign" VARCHAR(200),
    "utmTerm" VARCHAR(200),
    "utmContent" VARCHAR(200),
    "referrer" VARCHAR(500),
    "merchantId" VARCHAR(64),

    CONSTRAINT "MerchantLeadMonsterCalculatorSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantLeadMonsterAppointment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "calculatorSessionId" TEXT NOT NULL,
    "status" "MerchantLeadMonsterAppointmentStatus" NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(32),
    "businessName" VARCHAR(160) NOT NULL,
    "preferredTimeWindow" VARCHAR(120),
    "notes" VARCHAR(2000),

    CONSTRAINT "MerchantLeadMonsterAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MerchantLeadMonsterCalculatorSession_createdAt_idx" ON "MerchantLeadMonsterCalculatorSession"("createdAt");

-- CreateIndex
CREATE INDEX "MerchantLeadMonsterCalculatorSession_utmCampaign_idx" ON "MerchantLeadMonsterCalculatorSession"("utmCampaign");

-- CreateIndex
CREATE INDEX "MerchantLeadMonsterAppointment_createdAt_idx" ON "MerchantLeadMonsterAppointment"("createdAt");

-- CreateIndex
CREATE INDEX "MerchantLeadMonsterAppointment_email_idx" ON "MerchantLeadMonsterAppointment"("email");

-- CreateIndex
CREATE INDEX "MerchantLeadMonsterAppointment_calculatorSessionId_idx" ON "MerchantLeadMonsterAppointment"("calculatorSessionId");

-- AddForeignKey
ALTER TABLE "MerchantLeadMonsterAppointment" ADD CONSTRAINT "MerchantLeadMonsterAppointment_calculatorSessionId_fkey" FOREIGN KEY ("calculatorSessionId") REFERENCES "MerchantLeadMonsterCalculatorSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
