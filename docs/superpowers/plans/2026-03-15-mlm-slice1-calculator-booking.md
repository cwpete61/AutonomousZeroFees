# Merchant Lead Monster Slice 1 (Calculator + Booking) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a parallel Merchant Lead Monster (MLM) savings calculator and appointment request funnel (marketing pages + API + DB persistence) without changing or breaking the existing lead/campaign pipeline.

**Architecture:** Additive “strangler” slice: introduce new Prisma models and a new Nest module under `/mlm`, gated by env flags, plus new Next.js marketing routes under `/mlm/*`.

**Tech Stack:** Next.js (apps/marketing), NestJS + class-validator (apps/api), Prisma + Postgres (packages/db), Playwright (apps/e2e).

---

## File Map (new/modified)

**DB / Prisma**

- Modify: `packages/db/prisma/schema.prisma`

**API (NestJS)**

- Create: `apps/api/src/modules/mlm/mlm.module.ts`
- Create: `apps/api/src/modules/mlm/mlm.controller.ts`
- Create: `apps/api/src/modules/mlm/mlm.service.ts`
- Create: `apps/api/src/modules/mlm/mlm-calculator.math.ts`
- Create: `apps/api/src/modules/mlm/dto/create-calculator-session.dto.ts`
- Create: `apps/api/src/modules/mlm/dto/create-appointment.dto.ts`
- Test: `apps/api/src/modules/mlm/mlm-calculator.math.spec.ts`
- Test: `apps/api/src/modules/mlm/mlm.service.spec.ts`
- Test: `apps/api/test/mlm.e2e-spec.ts`
- Test: `apps/api/test/mlm-disabled.e2e-spec.ts`
- Modify: `apps/api/src/app.module.ts`

**Marketing (Next.js)**

- Create: `apps/marketing/src/app/mlm/page.tsx`
- Create: `apps/marketing/src/app/mlm/ReferrerCapture.tsx`
- Create: `apps/marketing/src/app/mlm/calculator/page.tsx`
- Create: `apps/marketing/src/app/mlm/calculator/CalculatorForm.tsx`
- Create: `apps/marketing/src/app/mlm/book/page.tsx`
- Create: `apps/marketing/src/app/mlm/book/BookingForm.tsx`
- Create: `apps/marketing/src/app/mlm/confirmed/page.tsx`
- Create: `apps/marketing/src/lib/mlm-api.ts`

**E2E**

- Create: `apps/e2e/tests/mlm-calculator.spec.ts`

**Docs/config**

- Modify: `.env.example`

Spec reference: `docs/superpowers/specs/2026-03-15-merchant-lead-monster-slice1-design.md`

---

## Chunk 1: DB + API (calculator sessions + appointments)

### Task 1: Add MLM env vars to examples

**Files:**

- Modify: `.env.example`

- [ ] **Step 1: Add env keys to `.env.example`**

Add:

```bash
# ─── Merchant Lead Monster (Slice 1) ─────────────────────────────
MLM_ENABLED=false
MLM_TARGET_RATE_PCT=2.2
NEXT_PUBLIC_MLM_ENABLED=false

# Used by marketing MLM pages to call API
# (Already present in this repo's `.env.example` in most cases)
NEXT_PUBLIC_API_URL=http://localhost:40000
```

- [ ] **Step 2: (Optional) quick sanity check**

Run: `git diff .env.example`
Expected: only additive lines.

### Task 2: Add Prisma models for calculator sessions + appointments

**Files:**

- Modify: `packages/db/prisma/schema.prisma`

- [ ] **Step 1: Add enum for appointment status**

Add near other enums:

```prisma
enum MlmAppointmentStatus {
  REQUESTED
}
```

- [ ] **Step 2: Add `MlmCalculatorSession` model**

Add near other models (position not important, but keep grouped):

```prisma
model MlmCalculatorSession {
  id String @id @default(cuid())

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  monthlyVolumeCents       BigInt @db.BigInt
  currentRateBps           Int
  targetRateBps            Int
  monthlyFeesCurrentCents  BigInt @db.BigInt
  monthlyFeesTargetCents   BigInt @db.BigInt
  monthlySavingsCents      BigInt @db.BigInt
  annualSavingsCents       BigInt @db.BigInt

  utmSource   String? @db.VarChar(200)
  utmMedium   String? @db.VarChar(200)
  utmCampaign String? @db.VarChar(200)
  utmTerm     String? @db.VarChar(200)
  utmContent  String? @db.VarChar(200)
  referrer    String? @db.VarChar(500)

  // reserved for later slices
  merchantId String? @db.VarChar(64)

  appointments MlmAppointment[]

  @@index([createdAt])
  @@index([utmCampaign])
}
```

- [ ] **Step 3: Add `MlmAppointment` model**

```prisma
model MlmAppointment {
  id String @id @default(cuid())

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  calculatorSessionId String
  status              MlmAppointmentStatus

  name                String @db.VarChar(120)
  email               String @db.VarChar(254)
  phone               String? @db.VarChar(32)
  businessName         String @db.VarChar(160)
  preferredTimeWindow String? @db.VarChar(120)
  notes               String? @db.VarChar(2000)

  calculatorSession MlmCalculatorSession @relation(fields: [calculatorSessionId], references: [id], onDelete: Cascade)

  @@index([createdAt])
  @@index([email])
  @@index([calculatorSessionId])
}
```

- [ ] **Step 4: Run Prisma migration**

Run:

`pnpm --filter @agency/db run db:migrate --name mlm_slice1_calculator_booking`

Expected:

- migration created under `packages/db/prisma/migrations/`
- Prisma client updated (or run next step)

- [ ] **Step 5: Regenerate Prisma client**

Run: `pnpm --filter @agency/db run db:generate`
Expected: `packages/db/generated/client` updated; TypeScript compiles where new models are referenced.

### Task 3: Add calculator math utilities (TDD)

**Files:**

- Create: `apps/api/src/modules/mlm/mlm-calculator.math.ts`
- Test: `apps/api/src/modules/mlm/mlm-calculator.math.spec.ts`

- [ ] **Step 1: Write failing tests for parsing + rounding**

Create `apps/api/src/modules/mlm/mlm-calculator.math.spec.ts`:

```ts
import {
  parseUsdToCents,
  parsePercentToBps,
  roundHalfUpDiv,
  centsToUsdString,
  computeFees,
} from "./mlm-calculator.math";

describe("mlm-calculator.math", () => {
  test("parseUsdToCents parses 2dp USD strings", () => {
    expect(parseUsdToCents("0.01")).toBe(1n);
    expect(parseUsdToCents("50000.00")).toBe(5_000_000n);
    expect(parseUsdToCents("12")).toBe(1200n);
  });

  test("parseUsdToCents rejects >2 decimals and non-numeric", () => {
    expect(() => parseUsdToCents("1.001")).toThrow();
    expect(() => parseUsdToCents("abc")).toThrow();
    expect(() => parseUsdToCents("-1.00")).toThrow();
  });

  test("parsePercentToBps parses up to 4 decimals", () => {
    expect(parsePercentToBps("2.9")).toBe(290);
    expect(parsePercentToBps("2.3456")).toBe(235); // 234.56 bps -> 235 half-up
    expect(parsePercentToBps("0.0100")).toBe(1);
  });

  test("roundHalfUpDiv rounds half-up for positive integers", () => {
    expect(roundHalfUpDiv(1n, 2n)).toBe(1n); // 0.5 -> 1
    expect(roundHalfUpDiv(3n, 2n)).toBe(2n); // 1.5 -> 2
    expect(roundHalfUpDiv(4n, 2n)).toBe(2n);
  });

  test("centsToUsdString formats cents deterministically", () => {
    expect(centsToUsdString(0n)).toBe("0.00");
    expect(centsToUsdString(1n)).toBe("0.01");
    expect(centsToUsdString(1200n)).toBe("12.00");
    expect(centsToUsdString(1234n)).toBe("12.34");
  });

  test("computeFees computes savings from cents + bps", () => {
    const result = computeFees({
      monthlyVolumeCents: 5_000_000n, // $50,000
      currentRateBps: 290,
      targetRateBps: 220,
    });

    expect(result.monthlyFeesCurrentCents).toBe(145_000n);
    expect(result.monthlyFeesTargetCents).toBe(110_000n);
    expect(result.monthlySavingsCents).toBe(35_000n);
    expect(result.annualSavingsCents).toBe(420_000n);
  });
});
```

- [ ] **Step 2: Run API unit tests (expect fail)**

Run: `pnpm --filter @agency/api test`
Expected: FAIL with missing module exports.

- [ ] **Step 3: Implement minimal math utilities**

Create `apps/api/src/modules/mlm/mlm-calculator.math.ts`:

```ts
export function parseUsdToCents(input: string): bigint {
  const s = (input ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new Error("Invalid USD amount");
  const [whole, frac = ""] = s.split(".");
  const cents = BigInt(whole) * 100n + BigInt((frac + "00").slice(0, 2));
  if (cents <= 0n) throw new Error("USD amount must be > 0");
  return cents;
}

export function parsePercentToBps(input: string): number {
  const s = (input ?? "").trim();
  if (!/^\d+(\.\d{1,4})?$/.test(s)) throw new Error("Invalid percent");
  const [whole, frac = ""] = s.split(".");
  const scale4 = BigInt(whole) * 10_000n + BigInt((frac + "0000").slice(0, 4));
  // bps = round_half_up(scale4 / 100)
  const bpsBig = roundHalfUpDiv(scale4, 100n);
  if (bpsBig <= 0n || bpsBig > 10_000n)
    throw new Error("Percent out of bounds");
  return Number(bpsBig);
}

export function roundHalfUpDiv(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new Error("Invalid denominator");
  if (numerator < 0n) throw new Error("Only positive supported");
  return (numerator + denominator / 2n) / denominator;
}

export function centsToUsdString(cents: bigint): string {
  if (cents < 0n) throw new Error("Only non-negative supported");
  const whole = cents / 100n;
  const frac = cents % 100n;
  return `${whole.toString()}.${frac.toString().padStart(2, "0")}`;
}

export function computeFees(params: {
  monthlyVolumeCents: bigint;
  currentRateBps: number;
  targetRateBps: number;
}) {
  const { monthlyVolumeCents, currentRateBps, targetRateBps } = params;
  const current = roundHalfUpDiv(
    monthlyVolumeCents * BigInt(currentRateBps),
    10_000n,
  );
  const target = roundHalfUpDiv(
    monthlyVolumeCents * BigInt(targetRateBps),
    10_000n,
  );
  const savings = current > target ? current - target : 0n;
  return {
    monthlyFeesCurrentCents: current,
    monthlyFeesTargetCents: target,
    monthlySavingsCents: savings,
    annualSavingsCents: savings * 12n,
  };
}
```

- [ ] **Step 4: Re-run API unit tests (expect pass)**

Run: `pnpm --filter @agency/api test`
Expected: PASS for `mlm-calculator.math.spec.ts`.

### Task 4: Add MLM API module (TDD)

**Files:**

- Create: `apps/api/src/modules/mlm/mlm.module.ts`
- Create: `apps/api/src/modules/mlm/mlm.controller.ts`
- Create: `apps/api/src/modules/mlm/mlm.service.ts`
- Create: `apps/api/src/modules/mlm/dto/create-calculator-session.dto.ts`
- Create: `apps/api/src/modules/mlm/dto/create-appointment.dto.ts`
- Test: `apps/api/src/modules/mlm/mlm.service.spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write failing service tests (mock Prisma)**

Create `apps/api/src/modules/mlm/mlm.service.spec.ts`:

```ts
import { Test } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { MlmService } from "./mlm.service";

const mockPrisma = {
  mlmCalculatorSession: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  mlmAppointment: {
    create: jest.fn(),
  },
};

describe("MlmService", () => {
  let service: MlmService;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [MlmService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = mod.get(MlmService);
    jest.clearAllMocks();
  });

  test("createCalculatorSession persists computed cents + tracking", async () => {
    mockPrisma.mlmCalculatorSession.create.mockResolvedValue({
      id: "cs_1",
      targetRateBps: 220,
      monthlyFeesCurrentCents: 145_000n,
      monthlyFeesTargetCents: 110_000n,
      monthlySavingsCents: 35_000n,
      annualSavingsCents: 420_000n,
    });

    const result = await service.createCalculatorSession({
      monthlyVolumeUsd: "50000.00",
      currentRatePct: "2.9",
      utm: { campaign: "x" },
      referrer: "https://example.com",
    });

    expect(mockPrisma.mlmCalculatorSession.create).toHaveBeenCalled();
    expect(result.id).toBe("cs_1");
    expect(result.monthlySavingsUsd).toBe("350.00");
  });

  test("getCalculatorSession throws on missing", async () => {
    mockPrisma.mlmCalculatorSession.findUnique.mockResolvedValue(null);
    await expect(service.getCalculatorSession("missing")).rejects.toThrow();
  });

  test("returns 503 when database is unavailable", async () => {
    mockPrisma.mlmCalculatorSession.create.mockRejectedValue({
      code: "P1001",
      message: "Can't reach database server",
    });
    await expect(
      service.createCalculatorSession({
        monthlyVolumeUsd: "50000.00",
        currentRatePct: "2.9",
      } as any),
    ).rejects.toThrow("Database unavailable");
  });
});
```

- [ ] **Step 2: Run API tests (expect fail)**

Run: `pnpm --filter @agency/api test`
Expected: FAIL (missing `MlmService`).

- [ ] **Step 3: Add DTOs for request validation**

Create `apps/api/src/modules/mlm/dto/create-calculator-session.dto.ts`:

```ts
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Transform, Type } from "class-transformer";

const trim = ({ value }: { value: any }) =>
  typeof value === "string" ? value.trim() : value;
const trimOptional = ({ value }: { value: any }) => {
  const v = typeof value === "string" ? value.trim() : value;
  return v ? v : undefined;
};

export class UtmDto {
  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(200)
  source?: string;
  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(200)
  medium?: string;
  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(200)
  campaign?: string;
  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(200)
  term?: string;
  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(200)
  content?: string;
}

export class CreateCalculatorSessionDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  monthlyVolumeUsd: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  currentRatePct: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UtmDto)
  utm?: UtmDto;

  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(500)
  referrer?: string;
}
```

Create `apps/api/src/modules/mlm/dto/create-appointment.dto.ts`:

```ts
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";

const trim = ({ value }: { value: any }) =>
  typeof value === "string" ? value.trim() : value;
const trimOptional = ({ value }: { value: any }) => {
  const v = typeof value === "string" ? value.trim() : value;
  return v ? v : undefined;
};

export class CreateAppointmentDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  calculatorSessionId: string;

  @Transform(trim)
  @IsString()
  @MaxLength(120)
  @IsNotEmpty()
  name: string;

  @Transform(trim)
  @IsEmail()
  @MaxLength(254)
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(32)
  @Matches(/^[+0-9()\-\s]{7,32}$/)
  phone?: string;

  @Transform(trim)
  @IsString()
  @MaxLength(160)
  @IsNotEmpty()
  businessName: string;

  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(120)
  preferredTimeWindow?: string;

  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
```

- [ ] **Step 4: Implement `MlmService` using deterministic parsing + Prisma**

Create `apps/api/src/modules/mlm/mlm.service.ts`:

```ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCalculatorSessionDto } from "./dto/create-calculator-session.dto";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import {
  centsToUsdString,
  computeFees,
  parsePercentToBps,
  parseUsdToCents,
} from "./mlm-calculator.math";

function cleanOptional(s?: string) {
  const v = (s ?? "").trim();
  return v.length ? v : undefined;
}

function isDatabaseUnavailable(e: any) {
  const name = (e?.name || "").toString();
  const msg = (e?.message || "").toString();
  const code = (e?.code || "").toString();
  return (
    ["P1000", "P1001", "P1002", "P1003", "P1008", "P1017"].includes(code) ||
    name.includes("PrismaClientInitializationError") ||
    msg.includes("Can't reach database server") ||
    msg.includes("ECONNREFUSED")
  );
}

@Injectable()
export class MlmService {
  constructor(private prisma: PrismaService) {}

  private getTargetRateBps(): number {
    const raw = cleanOptional(process.env.MLM_TARGET_RATE_PCT) ?? "2.2";
    return parsePercentToBps(raw);
  }

  async createCalculatorSession(dto: CreateCalculatorSessionDto) {
    let monthlyVolumeCents: bigint;
    let currentRateBps: number;
    let targetRateBps: number;
    try {
      monthlyVolumeCents = parseUsdToCents(dto.monthlyVolumeUsd);
      currentRateBps = parsePercentToBps(dto.currentRatePct);
      targetRateBps = this.getTargetRateBps();
    } catch (e: any) {
      throw new BadRequestException(e?.message || "Invalid inputs");
    }

    // Spec bound: monthlyVolumeUsd <= 1_000_000_000
    if (monthlyVolumeCents > 100_000_000_000n) {
      throw new BadRequestException("monthlyVolumeUsd too large");
    }

    const fees = computeFees({
      monthlyVolumeCents,
      currentRateBps,
      targetRateBps,
    });

    const utm = dto.utm || {};
    let session: any;
    try {
      session = await this.prisma.mlmCalculatorSession.create({
        data: {
          monthlyVolumeCents,
          currentRateBps,
          targetRateBps,
          monthlyFeesCurrentCents: fees.monthlyFeesCurrentCents,
          monthlyFeesTargetCents: fees.monthlyFeesTargetCents,
          monthlySavingsCents: fees.monthlySavingsCents,
          annualSavingsCents: fees.annualSavingsCents,
          utmSource: cleanOptional(utm.source),
          utmMedium: cleanOptional(utm.medium),
          utmCampaign: cleanOptional(utm.campaign),
          utmTerm: cleanOptional(utm.term),
          utmContent: cleanOptional(utm.content),
          referrer: cleanOptional(dto.referrer),
        },
        select: {
          id: true,
          targetRateBps: true,
          monthlyFeesCurrentCents: true,
          monthlyFeesTargetCents: true,
          monthlySavingsCents: true,
          annualSavingsCents: true,
        },
      });
    } catch (e: any) {
      if (isDatabaseUnavailable(e))
        throw new ServiceUnavailableException("Database unavailable");
      throw e;
    }

    return {
      id: session.id,
      targetRatePct: session.targetRateBps / 100,
      monthlyFeesCurrentUsd: centsToUsdString(session.monthlyFeesCurrentCents),
      monthlyFeesTargetUsd: centsToUsdString(session.monthlyFeesTargetCents),
      monthlySavingsUsd: centsToUsdString(session.monthlySavingsCents),
      annualSavingsUsd: centsToUsdString(session.annualSavingsCents),
    };
  }

  async getCalculatorSession(id: string) {
    let session: any;
    try {
      session = await this.prisma.mlmCalculatorSession.findUnique({
        where: { id },
        select: {
          id: true,
          targetRateBps: true,
          monthlyFeesCurrentCents: true,
          monthlyFeesTargetCents: true,
          monthlySavingsCents: true,
          annualSavingsCents: true,
        },
      });
    } catch (e: any) {
      if (isDatabaseUnavailable(e))
        throw new ServiceUnavailableException("Database unavailable");
      throw e;
    }
    if (!session) throw new NotFoundException("Calculator session not found");

    return {
      id: session.id,
      targetRatePct: session.targetRateBps / 100,
      monthlyFeesCurrentUsd: centsToUsdString(session.monthlyFeesCurrentCents),
      monthlyFeesTargetUsd: centsToUsdString(session.monthlyFeesTargetCents),
      monthlySavingsUsd: centsToUsdString(session.monthlySavingsCents),
      annualSavingsUsd: centsToUsdString(session.annualSavingsCents),
    };
  }

  async createAppointment(dto: CreateAppointmentDto) {
    let session: any;
    try {
      session = await this.prisma.mlmCalculatorSession.findUnique({
        where: { id: dto.calculatorSessionId },
        select: { id: true },
      });
    } catch (e: any) {
      if (isDatabaseUnavailable(e))
        throw new ServiceUnavailableException("Database unavailable");
      throw e;
    }
    if (!session) throw new NotFoundException("Calculator session not found");

    const name = cleanOptional(dto.name);
    const businessName = cleanOptional(dto.businessName);
    if (!name || !businessName)
      throw new BadRequestException("Missing required fields");

    let appt: any;
    try {
      appt = await this.prisma.mlmAppointment.create({
        data: {
          calculatorSessionId: dto.calculatorSessionId,
          status: "REQUESTED",
          name,
          email: dto.email,
          phone: cleanOptional(dto.phone),
          businessName,
          preferredTimeWindow: cleanOptional(dto.preferredTimeWindow),
          notes: cleanOptional(dto.notes),
        },
        select: { id: true, status: true },
      });
    } catch (e: any) {
      if (isDatabaseUnavailable(e))
        throw new ServiceUnavailableException("Database unavailable");
      throw e;
    }

    return appt;
  }
}
```

- [ ] **Step 5: Implement controller + module and wire into AppModule**

Create `apps/api/src/modules/mlm/mlm.controller.ts`:

```ts
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { MlmService } from "./mlm.service";
import { CreateCalculatorSessionDto } from "./dto/create-calculator-session.dto";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";

@ApiTags("mlm")
@Controller("mlm")
export class MlmController {
  constructor(private mlm: MlmService) {}

  @Post("calculator/sessions")
  @ApiOperation({ summary: "Create an MLM calculator session" })
  createSession(@Body() dto: CreateCalculatorSessionDto) {
    return this.mlm.createCalculatorSession(dto);
  }

  @Get("calculator/sessions/:id")
  @ApiOperation({ summary: "Fetch an MLM calculator session" })
  getSession(@Param("id") id: string) {
    return this.mlm.getCalculatorSession(id);
  }

  @Post("appointments")
  @ApiOperation({ summary: "Create an MLM appointment request" })
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.mlm.createAppointment(dto);
  }
}
```

Create `apps/api/src/modules/mlm/mlm.module.ts`:

```ts
import { Module } from "@nestjs/common";
import { MlmController } from "./mlm.controller";
import { MlmService } from "./mlm.service";

@Module({
  controllers: [MlmController],
  providers: [MlmService],
})
export class MlmModule {}
```

Modify `apps/api/src/app.module.ts` imports to conditionally include `MlmModule` when `MLM_ENABLED=true`:

```ts
import { MlmModule } from './modules/mlm/mlm.module';
// ...
 ...(process.env.MLM_ENABLED === 'true' ? [MlmModule] : []),
```

- [ ] **Step 6: Re-run API tests**

Run: `pnpm --filter @agency/api test`
Expected: PASS.

- [ ] **Step 7: Typecheck API**

Run: `pnpm --filter @agency/api run typecheck`
Expected: PASS.

### Task 4.1: Add API e2e tests for MLM controller (mocked Prisma)

**Files:**

- Create: `apps/api/test/mlm.e2e-spec.ts`

- [ ] **Step 1: Create e2e test mirroring existing patterns**

Create `apps/api/test/mlm.e2e-spec.ts`:

```ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { PrismaService } from "../src/modules/prisma/prisma.service";

describe("MLM (e2e)", () => {
  let app: INestApplication;
  const prev = process.env.MLM_ENABLED;

  beforeAll(async () => {
    process.env.MLM_ENABLED = "true";
    const { AppModule } = await import("../src/app.module");

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        mlmCalculatorSession: {
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
        mlmAppointment: {
          create: jest
            .fn()
            .mockResolvedValue({ id: "ap_1", status: "REQUESTED" }),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (prev === undefined) delete process.env.MLM_ENABLED;
    else process.env.MLM_ENABLED = prev;
  });

  it("POST /mlm/calculator/sessions returns computed USD strings", async () => {
    await request(app.getHttpServer())
      .post("/mlm/calculator/sessions")
      .send({ monthlyVolumeUsd: "50000.00", currentRatePct: "2.9" })
      .expect(201)
      .expect((res) => {
        expect(res.body.monthlySavingsUsd).toBe("350.00");
      });
  });
});
```

Create `apps/api/test/mlm-disabled.e2e-spec.ts`:

```ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { PrismaService } from "../src/modules/prisma/prisma.service";

describe("MLM (disabled) (e2e)", () => {
  let app: INestApplication;
  const prev = process.env.MLM_ENABLED;

  beforeAll(async () => {
    delete process.env.MLM_ENABLED;
    const { AppModule } = await import("../src/app.module");

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (prev === undefined) delete process.env.MLM_ENABLED;
    else process.env.MLM_ENABLED = prev;
  });

  it("returns 404 for MLM routes when disabled", async () => {
    await request(app.getHttpServer())
      .post("/mlm/calculator/sessions")
      .send({ monthlyVolumeUsd: "50000.00", currentRatePct: "2.9" })
      .expect(404);

    await request(app.getHttpServer())
      .get("/mlm/calculator/sessions/cs_1")
      .expect(404);

    await request(app.getHttpServer())
      .post("/mlm/appointments")
      .send({
        calculatorSessionId: "cs_1",
        name: "A",
        email: "a@b.com",
        businessName: "Biz",
      })
      .expect(404);
  });
});
```

- [ ] **Step 2: Run API e2e tests**

Run: `pnpm --filter @agency/api run test:e2e`
Expected: PASS.

### Task 4.2: Rate limiting notes

- [ ] **Step 1: Confirm global throttling is active**

`apps/api/src/app.module.ts` already configures `ThrottlerModule` globally (100 req/min). For Slice 1, this satisfies the “basic IP-based rate limiting” requirement.

- [ ] **Step 2: (Optional) proxy-awareness**

If deploying behind a reverse proxy and you want client-IP-based throttling, add an explicit `trust proxy` configuration in `apps/api/src/main.ts` behind an env flag (e.g. `TRUST_PROXY=true`).

---

## Chunk 2: Marketing routes + E2E

### Task 5: Add marketing API helper

**Files:**

- Create: `apps/marketing/src/lib/mlm-api.ts`

- [ ] **Step 1: Implement a tiny fetch wrapper**

Create `apps/marketing/src/lib/mlm-api.ts`:

```ts
export function mlmEnabled() {
  return process.env.NEXT_PUBLIC_MLM_ENABLED === "true";
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:40000";
}

export async function createCalculatorSession(payload: any) {
  const res = await fetch(`${baseUrl()}/mlm/calculator/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function getCalculatorSession(id: string) {
  const res = await fetch(`${baseUrl()}/mlm/calculator/sessions/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function createAppointment(payload: any) {
  const res = await fetch(`${baseUrl()}/mlm/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
```

Note on feature flags in Next.js:

- `NEXT_PUBLIC_MLM_ENABLED` is typically inlined at build time. Treat it as a deploy-time toggle (changing it may require a rebuild/redeploy of `apps/marketing`, not just a restart).

### Task 5.1: Ensure browser calls from marketing to API work (CORS)

**Files:**

- Modify: `apps/api/src/main.ts`

- [ ] **Step 1: Add marketing origins to allowedOrigins**

In `apps/api/src/main.ts`, extend `allowedOrigins` to include:

```ts
'http://localhost:20000',
'http://localhost:20001',
```

- [ ] **Step 2: Verify in browser**

With `apps/api` and `apps/marketing` running, submit the calculator form.
Expected: no CORS error in the browser console.

### Task 6: Add `/mlm` landing page (gated)

**Files:**

- Create: `apps/marketing/src/app/mlm/page.tsx`
- Create: `apps/marketing/src/app/mlm/ReferrerCapture.tsx`

- [ ] **Step 1: Create server page that 404s when disabled**

- [ ] **Step 2: Add a tiny client component to capture initial referrer**

Create `apps/marketing/src/app/mlm/ReferrerCapture.tsx`:

```tsx
"use client";

import { useEffect } from "react";

export function ReferrerCapture() {
  useEffect(() => {
    try {
      const key = "mlm_initial_referrer";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, document.referrer || "");
      }
    } catch {
      // ignore
    }
  }, []);

  return null;
}
```

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { mlmEnabled } from "../../lib/mlm-api";
import { ReferrerCapture } from "./ReferrerCapture";

export default function MlmLanding({
  searchParams,
}: {
  searchParams?: Record<string, string | string[]>;
}) {
  if (!mlmEnabled()) return notFound();

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams || {})) {
    if (typeof v === "string") qs.set(k, v);
    else if (Array.isArray(v) && v[0]) qs.set(k, v[0]);
  }
  const calculatorHref = qs.toString()
    ? `/mlm/calculator?${qs.toString()}`
    : "/mlm/calculator";

  return (
    <main className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
      <ReferrerCapture />
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          lineHeight: 1.1,
        }}
      >
        Merchant Savings Calculator
      </h1>
      <p
        style={{ color: "var(--text-secondary)", marginTop: 16, maxWidth: 720 }}
      >
        Estimate what you could save on credit card processing fees and request
        a quick savings review.
      </p>
      <div style={{ marginTop: 28 }}>
        <Link className="nav-cta" href={calculatorHref}>
          Check Savings
        </Link>
      </div>
    </main>
  );
}
```

### Task 7: Add calculator page + client form

**Files:**

- Create: `apps/marketing/src/app/mlm/calculator/page.tsx`
- Create: `apps/marketing/src/app/mlm/calculator/CalculatorForm.tsx`

- [ ] **Step 1: Create server page wrapper (gated)**

`apps/marketing/src/app/mlm/calculator/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { mlmEnabled } from "../../../lib/mlm-api";
import { CalculatorForm } from "./CalculatorForm";

export default function CalculatorPage() {
  if (!mlmEnabled()) return notFound();
  return (
    <main className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
        }}
      >
        Processing Fee Savings
      </h1>
      <p
        style={{ color: "var(--text-secondary)", marginTop: 12, maxWidth: 720 }}
      >
        Enter your estimated monthly card volume and current rate.
      </p>
      <div style={{ marginTop: 24, maxWidth: 720 }}>
        <CalculatorForm />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Implement client form that calls API and routes to booking**

`apps/marketing/src/app/mlm/calculator/CalculatorForm.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createCalculatorSession } from "../../../lib/mlm-api";

export function CalculatorForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [monthlyVolumeUsd, setMonthlyVolumeUsd] = useState("");
  const [currentRatePct, setCurrentRatePct] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const utm = useMemo(
    () => ({
      source: params.get("utm_source") || undefined,
      medium: params.get("utm_medium") || undefined,
      campaign: params.get("utm_campaign") || undefined,
      term: params.get("utm_term") || undefined,
      content: params.get("utm_content") || undefined,
    }),
    [params],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        monthlyVolumeUsd,
        currentRatePct,
        utm,
        referrer: (() => {
          try {
            return (
              sessionStorage.getItem("mlm_initial_referrer") ||
              document.referrer ||
              undefined
            );
          } catch {
            return document.referrer || undefined;
          }
        })(),
      };
      const r = await createCalculatorSession(payload);
      setResult(r);
    } catch (err: any) {
      setError("Could not calculate savings. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Monthly card volume (USD)
          </span>
          <input
            value={monthlyVolumeUsd}
            onChange={(e) => setMonthlyVolumeUsd(e.target.value)}
            placeholder="50000.00"
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-deep)",
              color: "var(--text-primary)",
            }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Current rate (%)
          </span>
          <input
            value={currentRatePct}
            onChange={(e) => setCurrentRatePct(e.target.value)}
            placeholder="2.9"
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-deep)",
              color: "var(--text-primary)",
            }}
          />
        </label>
        <button
          className="nav-cta"
          disabled={loading}
          style={{
            justifySelf: "start",
            padding: "10px 18px",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Calculating…" : "Calculate Savings"}
        </button>
        {error ? <div style={{ color: "#fca5a5" }}>{error}</div> : null}
      </form>

      {result ? (
        <div
          style={{
            marginTop: 18,
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: 16,
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-secondary)" }}>
              Monthly savings
            </span>
            <span style={{ fontFamily: "var(--font-heading)" }}>
              ${result.monthlySavingsUsd}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-secondary)" }}>
              Annual savings
            </span>
            <span style={{ fontFamily: "var(--font-heading)" }}>
              ${result.annualSavingsUsd}
            </span>
          </div>
          <button
            className="nav-cta"
            onClick={() =>
              router.push(`/mlm/book?session=${encodeURIComponent(result.id)}`)
            }
            style={{ justifySelf: "start", marginTop: 6, padding: "10px 18px" }}
          >
            Book a Savings Review
          </button>
        </div>
      ) : null}
    </div>
  );
}
```

### Task 8: Add booking page + confirmation

**Files:**

- Create: `apps/marketing/src/app/mlm/book/page.tsx`
- Create: `apps/marketing/src/app/mlm/book/BookingForm.tsx`
- Create: `apps/marketing/src/app/mlm/confirmed/page.tsx`

- [ ] **Step 1: Booking server page (gated) + client form**

`apps/marketing/src/app/mlm/book/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { mlmEnabled } from "../../../lib/mlm-api";
import { BookingForm } from "./BookingForm";

export default function BookPage() {
  if (!mlmEnabled()) return notFound();
  return (
    <main className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
        }}
      >
        Request an Appointment
      </h1>
      <p
        style={{ color: "var(--text-secondary)", marginTop: 12, maxWidth: 720 }}
      >
        We’ll confirm a time after you submit your request.
      </p>
      <div style={{ marginTop: 24, maxWidth: 720 }}>
        <BookingForm />
      </div>
    </main>
  );
}
```

`apps/marketing/src/app/mlm/book/BookingForm.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createAppointment, getCalculatorSession } from "../../../lib/mlm-api";

export function BookingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session") || "";
  const [sessionOk, setSessionOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [preferredTimeWindow, setPreferredTimeWindow] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!sessionId) throw new Error("missing");
        await getCalculatorSession(sessionId);
        if (alive) setSessionOk(true);
      } catch {
        if (alive) setError("Session expired. Please re-run the calculator.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const appt = await createAppointment({
        calculatorSessionId: sessionId,
        name,
        email,
        phone: phone || undefined,
        businessName,
        preferredTimeWindow: preferredTimeWindow || undefined,
        notes: notes || undefined,
      });
      router.push(`/mlm/confirmed?appt=${encodeURIComponent(appt.id)}`);
    } catch {
      setError("Could not submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          padding: 20,
        }}
      >
        <div style={{ color: "#fca5a5" }}>{error}</div>
        <a
          className="nav-cta"
          href="/mlm/calculator"
          style={{ display: "inline-block", marginTop: 14 }}
        >
          Back to Calculator
        </a>
      </div>
    );
  }

  if (!sessionOk)
    return <div style={{ color: "var(--text-secondary)" }}>Loading…</div>;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-deep)",
            color: "var(--text-primary)",
          }}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-deep)",
            color: "var(--text-primary)",
          }}
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-deep)",
            color: "var(--text-primary)",
          }}
        />
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Business name"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-deep)",
            color: "var(--text-primary)",
          }}
        />
        <input
          value={preferredTimeWindow}
          onChange={(e) => setPreferredTimeWindow(e.target.value)}
          placeholder="Preferred time window (optional)"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-deep)",
            color: "var(--text-primary)",
          }}
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={4}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-deep)",
            color: "var(--text-primary)",
            resize: "vertical",
          }}
        />

        <button
          className="nav-cta"
          disabled={loading}
          style={{
            justifySelf: "start",
            padding: "10px 18px",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Submitting…" : "Request Appointment"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Confirmation page**

`apps/marketing/src/app/mlm/confirmed/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { mlmEnabled } from "../../../lib/mlm-api";

export default function ConfirmedPage() {
  if (!mlmEnabled()) return notFound();
  return (
    <main className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
        }}
      >
        Request Received
      </h1>
      <p
        style={{ color: "var(--text-secondary)", marginTop: 12, maxWidth: 720 }}
      >
        Thanks — we’ll reach out shortly to confirm a time.
      </p>
      <div style={{ marginTop: 24 }}>
        <a className="nav-cta" href="/mlm/calculator">
          Run Another Estimate
        </a>
      </div>
    </main>
  );
}
```

### Task 9: Add Playwright E2E for MLM (optional/gated)

**Files:**

- Create: `apps/e2e/tests/mlm-calculator.spec.ts`

- [ ] **Step 1: Add gated E2E test**

Recommended CI posture:

- Run this test in CI by setting `RUN_MLM_E2E=1` and ensuring `MARKETING_BASE_URL` points at a running marketing service.
- Ensure these flags are enabled in the environment running the test:
  - `MLM_ENABLED=true` (API routes wired)
  - `NEXT_PUBLIC_MLM_ENABLED=true` (marketing routes enabled)
  - `NEXT_PUBLIC_API_URL=http://localhost:40000` (or your API URL)

Create `apps/e2e/tests/mlm-calculator.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("MLM Calculator + Booking (Marketing)", () => {
  test.skip(
    !process.env.RUN_MLM_E2E,
    "Set RUN_MLM_E2E=1 to run MLM marketing E2E",
  );

  test("happy path", async ({ page }) => {
    const marketingBase =
      process.env.MARKETING_BASE_URL || "http://localhost:20000";

    await page.goto(`${marketingBase}/mlm/calculator`);
    await page.fill('input[placeholder="50000.00"]', "50000.00");
    await page.fill('input[placeholder="2.9"]', "2.9");
    await page.getByRole("button", { name: "Calculate Savings" }).click();
    await expect(page.locator("text=Annual savings")).toBeVisible();

    await page.getByRole("button", { name: "Book a Savings Review" }).click();
    await expect(page.locator("text=Request an Appointment")).toBeVisible();

    await page.fill('input[placeholder="Your name"]', "Test User");
    await page.fill('input[placeholder="Email"]', "test@example.com");
    await page.fill('input[placeholder="Business name"]', "Test Biz");
    await page.getByRole("button", { name: "Request Appointment" }).click();

    await expect(page.locator("text=Request Received")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run MLM Playwright E2E (local/CI command)**

Run (example):

`RUN_MLM_E2E=1 MARKETING_BASE_URL=http://localhost:20000 pnpm --filter @agency/e2e test -g "MLM"`

Expected: PASS.

### Task 10: Verification runbook

- [ ] **Step 1: Start infra (docker) for local verification**

Run: `docker compose up -d postgres redis api marketing`
Expected: all services healthy.

- [ ] **Step 2: Set env flags**

Set in `.env` (or docker env):

```bash
MLM_ENABLED=true
MLM_TARGET_RATE_PCT=2.2
NEXT_PUBLIC_MLM_ENABLED=true
NEXT_PUBLIC_API_URL=http://localhost:40000
```

- [ ] **Step 3: Manual smoke**

Open:

- `http://localhost:20000/mlm`
- `http://localhost:20000/mlm/calculator`

Expected:

- calculator computes and routes to booking
- booking submits and shows confirmation

- [ ] **Step 4: Run unit tests**

Run:

- `pnpm --filter @agency/api test`

- [ ] **Step 5: (Optional) run gated e2e**

Run:

`RUN_MLM_E2E=1 MARKETING_BASE_URL=http://localhost:20000 pnpm --filter @agency/e2e test -g "MLM"`

Expected: PASS.
