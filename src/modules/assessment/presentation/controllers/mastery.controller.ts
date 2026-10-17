import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';
import { AssessmentService } from '../services/assessment.service';
import { ApplyMasteryOverrideDto } from '../dto';

@Controller('students/:studentId/mastery')
@UseGuards(AuthGuard)
export class MasteryController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Get()
  async getStudentMastery(
    @Param('studentId') studentId: string,
    @Query('orgId') orgId?: string,
    @Query('curriculumNodeId') curriculumNodeId?: string,
  ) {
    return this.assessmentService.getStudentMastery(
      studentId,
      orgId,
      curriculumNodeId,
    );
  }

  @Post(':nodeId/override')
  async applyMasteryOverride(
    @Param('studentId') studentId: string,
    @Param('nodeId') nodeId: string,
    @Body() dto: ApplyMasteryOverrideDto,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    const orgId = user?.organizationId ?? 'default-org';
    return this.assessmentService.applyMasteryOverride(
      studentId,
      nodeId,
      orgId,
      dto,
      correlationId,
    );
  }
}
