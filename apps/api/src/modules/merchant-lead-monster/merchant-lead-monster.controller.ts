import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { CreateCalculatorSessionDto } from "./dto/create-calculator-session.dto";
import { MerchantLeadMonsterService } from "./merchant-lead-monster.service";

@ApiTags("merchant-lead-monster")
@Controller("merchant-lead-monster")
export class MerchantLeadMonsterController {
  constructor(private merchantLeadMonster: MerchantLeadMonsterService) {}

  @Post("calculator/sessions")
  @ApiOperation({
    summary: "Create a Merchant Lead Monster calculator session",
  })
  createSession(@Body() dto: CreateCalculatorSessionDto) {
    return this.merchantLeadMonster.createCalculatorSession(dto);
  }

  @Get("calculator/sessions/:id")
  @ApiOperation({ summary: "Fetch a Merchant Lead Monster calculator session" })
  getSession(@Param("id") id: string) {
    return this.merchantLeadMonster.getCalculatorSession(id);
  }

  @Post("appointments")
  @ApiOperation({
    summary: "Create a Merchant Lead Monster appointment request",
  })
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.merchantLeadMonster.createAppointment(dto);
  }
}
