import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { MlmService } from './mlm.service';
import { CreateCalculatorSessionDto } from './dto/calculator.dto';
import { CreateAppointmentDto } from './dto/appointment.dto';

@Controller('mlm')
export class MlmController {
  constructor(private readonly mlmService: MlmService) {}

  @Post('calculator/sessions')
  @UsePipes(new ValidationPipe({ transform: true }))
  createSession(@Body() dto: CreateCalculatorSessionDto) {
    return this.mlmService.createCalculatorSession(dto);
  }

  @Get('calculator/sessions/:id')
  getSession(@Param('id') id: string) {
    return this.mlmService.getCalculatorSession(id);
  }

  @Post('appointments')
  @UsePipes(new ValidationPipe({ transform: true }))
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.mlmService.createAppointment(dto);
  }
}
