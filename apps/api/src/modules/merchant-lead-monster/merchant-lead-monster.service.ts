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
} from "./merchant-lead-monster-calculator.math";

function cleanOptional(s?: string) {
  const v = (s ?? "").trim();
  return v.length ? v : undefined;
}

function isDatabaseUnavailable(e: any) {
  const code = (e?.code || "").toString();
  const name = (e?.name || "").toString();
  const msg = (e?.message || "").toString();
  return (
    ["P1000", "P1001", "P1002", "P1003", "P1008", "P1017"].includes(code) ||
    name.includes("PrismaClientInitializationError") ||
    msg.includes("Can't reach database server") ||
    msg.includes("ECONNREFUSED")
  );
}

@Injectable()
export class MerchantLeadMonsterService {
  constructor(private prisma: PrismaService) {}

  private getTargetRateBps(): number {
    const raw =
      cleanOptional(process.env.MERCHANT_LEAD_MONSTER_TARGET_RATE_PCT) ??
      cleanOptional(process.env.MLM_TARGET_RATE_PCT) ??
      "2.2";
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

    let session: {
      id: string;
      targetRateBps: number;
      monthlyFeesCurrentCents: bigint;
      monthlyFeesTargetCents: bigint;
      monthlySavingsCents: bigint;
      annualSavingsCents: bigint;
    };

    try {
      session = await this.prisma.merchantLeadMonsterCalculatorSession.create({
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
      if (isDatabaseUnavailable(e)) {
        throw new ServiceUnavailableException("Database unavailable");
      }
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
    let session: {
      id: string;
      targetRateBps: number;
      monthlyFeesCurrentCents: bigint;
      monthlyFeesTargetCents: bigint;
      monthlySavingsCents: bigint;
      annualSavingsCents: bigint;
    } | null;

    try {
      session =
        await this.prisma.merchantLeadMonsterCalculatorSession.findUnique({
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
      if (isDatabaseUnavailable(e)) {
        throw new ServiceUnavailableException("Database unavailable");
      }
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
    let session: { id: string } | null;

    try {
      session =
        await this.prisma.merchantLeadMonsterCalculatorSession.findUnique({
          where: { id: dto.calculatorSessionId },
          select: { id: true },
        });
    } catch (e: any) {
      if (isDatabaseUnavailable(e)) {
        throw new ServiceUnavailableException("Database unavailable");
      }
      throw e;
    }

    if (!session) throw new NotFoundException("Calculator session not found");

    const name = cleanOptional(dto.name);
    const businessName = cleanOptional(dto.businessName);
    if (!name || !businessName)
      throw new BadRequestException("Missing required fields");

    try {
      return await this.prisma.merchantLeadMonsterAppointment.create({
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
      if (isDatabaseUnavailable(e)) {
        throw new ServiceUnavailableException("Database unavailable");
      }
      throw e;
    }
  }
}
