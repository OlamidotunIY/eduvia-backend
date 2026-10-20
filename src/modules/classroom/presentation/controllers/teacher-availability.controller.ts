import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/shared';
import { TeacherAvailabilityService } from '../services/teacher-availability.service';
import {
  SetTeacherAvailabilityDto,
  AddAvailabilityExceptionDto,
} from '../dto';

@Controller('teachers/:teacherId')
@UseGuards(AuthGuard)
export class TeacherAvailabilityController {
  constructor(
    private readonly availabilityService: TeacherAvailabilityService,
  ) {}

  @Get('availability')
  async getAvailability(
    @Param('teacherId') teacherId: string,
    @Headers('x-organization-id') orgId: string,
  ) {
    return this.availabilityService.getAvailability(orgId, teacherId);
  }

  @Put('availability')
  async setAvailability(
    @Param('teacherId') teacherId: string,
    @Headers('x-organization-id') orgId: string,
    @Body() dto: SetTeacherAvailabilityDto,
  ) {
    return this.availabilityService.setAvailability(orgId, teacherId, dto);
  }

  @Post('availability/exceptions')
  async addException(
    @Param('teacherId') teacherId: string,
    @Headers('x-organization-id') orgId: string,
    @Body() dto: AddAvailabilityExceptionDto,
  ) {
    return this.availabilityService.addException(orgId, teacherId, dto);
  }

  @Delete('availability/exceptions/:id')
  async removeException(
    @Param('teacherId') teacherId: string,
    @Param('id') exceptionId: string,
    @Headers('x-organization-id') orgId: string,
  ) {
    return this.availabilityService.removeException(
      orgId,
      teacherId,
      exceptionId,
    );
  }

  @Get('available-slots')
  async getAvailableSlots(
    @Param('teacherId') teacherId: string,
    @Headers('x-organization-id') orgId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('durationMins') durationMins?: string,
  ) {
    return this.availabilityService.getAvailableSlots(
      orgId,
      teacherId,
      new Date(startDate),
      new Date(endDate),
      durationMins ? parseInt(durationMins, 10) : 60,
    );
  }
}
