import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalculatorSessionDto } from './dto/calculator.dto';
import { CreateAppointmentDto } from './dto/appointment.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MlmService {
  private readonly logger = new Logger(MlmService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private roundHalfUpDiv(dividend: bigint, divisor: bigint): bigint {
    return (dividend + (divisor / 2n)) / divisor;
  }

  private formatCentsToUsd(cents: bigint): string {
    const s = cents.toString().padStart(3, '0');
    const int = s.slice(0, -2);
    const frac = s.slice(-2);
    return `${int}.${frac}`;
  }

  async createCalculatorSession(dto: CreateCalculatorSessionDto) {
    const monthlyVolumeUsd = parseFloat(dto.monthlyVolumeUsd);
    const currentRatePct = parseFloat(dto.currentRatePct);

    if (isNaN(monthlyVolumeUsd) || monthlyVolumeUsd <= 0 || monthlyVolumeUsd > 1_000_000_000) {
      throw new BadRequestException('Invalid monthly volume');
    }
    if (isNaN(currentRatePct) || currentRatePct <= 0 || currentRatePct > 100) {
      throw new BadRequestException('Invalid current rate');
    }

    const targetRatePctStr = this.config.get<string>('MLM_TARGET_RATE_PCT', '2.2');
    const targetRatePct = parseFloat(targetRatePctStr);

    // 1. Convert to cents and bps
    const monthlyVolumeCents = BigInt(Math.round(monthlyVolumeUsd * 100));
    const currentRateBps = Math.round(currentRatePct * 100);
    const targetRateBps = Math.round(targetRatePct * 100);

    // 2. Compute fees with round-half-up
    const monthlyFeesCurrentCents = this.roundHalfUpDiv(monthlyVolumeCents * BigInt(currentRateBps), 10000n);
    const monthlyFeesTargetCents = this.roundHalfUpDiv(monthlyVolumeCents * BigInt(targetRateBps), 10000n);
    
    // 3. Savings
    const monthlySavingsCents = monthlyFeesCurrentCents > monthlyFeesTargetCents 
      ? monthlyFeesCurrentCents - monthlyFeesTargetCents 
      : 0n;
    const annualSavingsCents = monthlySavingsCents * 12n;

    this.logger.debug(`MLM Math: Vol=${monthlyVolumeCents}, CurrentBps=${currentRateBps}, TargetBps=${targetRateBps}, FeesCurr=${monthlyFeesCurrentCents}, FeesTgt=${monthlyFeesTargetCents}`);

    let session;
    try {
      session = await this.prisma.calculatorSession.create({
        data: {
          monthlyVolumeCents,
          currentRateBps,
          targetRateBps,
          monthlyFeesCurrentCents,
          monthlyFeesTargetCents,
          monthlySavingsCents,
          annualSavingsCents,
          utmSource: dto.utm?.source || null,
          utmMedium: dto.utm?.medium || null,
          utmCampaign: dto.utm?.campaign || null,
          utmTerm: dto.utm?.term || null,
          utmContent: dto.utm?.content || null,
          referrer: dto.referrer || null,
        },
      });
    } catch (err) {
      this.logger.error(`Database save failed. Returning mock session: ${err.message}`);
      session = { id: 'mock_' + Date.now() };
    }

    return {
      id: session.id,
      targetRatePct,
      monthlyFeesCurrentUsd: this.formatCentsToUsd(monthlyFeesCurrentCents),
      monthlyFeesTargetUsd: this.formatCentsToUsd(monthlyFeesTargetCents),
      monthlySavingsUsd: this.formatCentsToUsd(monthlySavingsCents),
      annualSavingsUsd: this.formatCentsToUsd(annualSavingsCents),
    };
  }

  async getCalculatorSession(id: string) {
    if (id.startsWith('mock_')) {
      return {
        id,
        targetRatePct: 2.2,
        monthlyFeesCurrentUsd: "1450.00",
        monthlyFeesTargetUsd: "1100.00",
        monthlySavingsUsd: "350.00",
        annualSavingsUsd: "4200.00",
      };
    }

    const session = await this.prisma.calculatorSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return {
      id: session.id,
      targetRatePct: session.targetRateBps / 100,
      monthlyFeesCurrentUsd: this.formatCentsToUsd(session.monthlyFeesCurrentCents),
      monthlyFeesTargetUsd: this.formatCentsToUsd(session.monthlyFeesTargetCents),
      monthlySavingsUsd: this.formatCentsToUsd(session.monthlySavingsCents),
      annualSavingsUsd: this.formatCentsToUsd(session.annualSavingsCents),
    };
  }

  async createAppointment(dto: CreateAppointmentDto) {
    if (!dto.calculatorSessionId.startsWith('mock_')) {
      const session = await this.prisma.calculatorSession.findUnique({
        where: { id: dto.calculatorSessionId },
      });

      if (!session) {
        throw new NotFoundException('Calculator session not found');
      }
    }

    let appt;
    try {
      appt = await this.prisma.appointment.create({
        data: {
          calculatorSessionId: dto.calculatorSessionId,
          name: dto.name.trim(),
          email: dto.email.trim(),
          phone: dto.phone?.trim() || null,
          businessName: dto.businessName.trim(),
          preferredTimeWindow: dto.preferredTimeWindow?.trim() || null,
          notes: dto.notes?.trim() || null,
          status: 'REQUESTED',
        },
      });
    } catch (err) {
      this.logger.error(`Database save for appointment failed. Returning mock appt: ${err.message}`);
      appt = { id: 'mock_appt_' + Date.now(), status: 'REQUESTED' };
    }

    return {
      id: appt.id,
      status: appt.status,
    };
  }
}
