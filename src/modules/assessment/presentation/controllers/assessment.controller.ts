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
import { CreateAssessmentDto, ApplyTeacherMarkDto } from '../dto';

@Controller('orgs/:orgId/assessments')
@UseGuards(AuthGuard)
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  async createAssessment(
    @Param('orgId') orgId: string,
    @Body() dto: CreateAssessmentDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.assessmentService.createAssessment(orgId, dto, correlationId);
  }

  @Get()
  async listAssessments(
    @Param('orgId') orgId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const pagination =
      skip !== undefined || take !== undefined
        ? {
            skip: skip ? Number(skip) : undefined,
            take: take ? Number(take) : undefined,
          }
        : undefined;
    return this.assessmentService.listAssessments(orgId, pagination);
  }

  @Get(':id')
  async getAssessment(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
  ) {
    return this.assessmentService.getAssessment(id, orgId);
  }

  @Post(':id/items/:itemId/mark')
  async applyTeacherMark(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: ApplyTeacherMarkDto,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    return this.assessmentService.applyTeacherMark(
      id,
      itemId,
      dto,
      user?.id ?? 'teacher',
      correlationId,
    );
  }

  @Post(':id/finalize')
  async finalizeAssessment(
    @Param('id') id: string,
    @Body('curriculumNodeId') curriculumNodeId: string | null,
    @CorrelationId() correlationId: string,
  ) {
    return this.assessmentService.finalizeAssessment(
      id,
      curriculumNodeId,
      correlationId,
    );
  }
}
