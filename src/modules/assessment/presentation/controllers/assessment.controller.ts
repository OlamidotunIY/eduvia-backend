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
  OrganizationPermissionGuard,
  RequireOrganizationPermissions,
  type CurrentUserPayload,
} from '@modules/shared';
import { AssessmentService } from '../services/assessment.service';
import { CreateAssessmentDto, ApplyTeacherMarkDto } from '../dto';
import { OrganizationPermission } from '../../../org/domain';
import { AssessmentStatus } from '../../domain';

@Controller('orgs/:orgId/assessments')
@UseGuards(AuthGuard, OrganizationPermissionGuard)
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  @RequireOrganizationPermissions(OrganizationPermission.ASSESSMENTS_CREATE)
  async createAssessment(
    @Param('orgId') orgId: string,
    @Body() dto: CreateAssessmentDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.assessmentService.createAssessment(orgId, dto, correlationId);
  }

  @Get()
  @RequireOrganizationPermissions(OrganizationPermission.ASSESSMENTS_READ)
  async listAssessments(
    @Param('orgId') orgId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: AssessmentStatus,
    @Query('lessonId') lessonId?: string,
    @Query('boardId') boardId?: string,
    @Query('studentId') studentId?: string,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
  ) {
    const pagination =
      skip !== undefined || take !== undefined
        ? {
            skip: skip ? Number(skip) : undefined,
            take: take ? Number(take) : undefined,
          }
        : undefined;
    return this.assessmentService.listAssessments(
      orgId,
      this.toFilter({
        status,
        lessonId,
        boardId,
        studentId,
        createdFrom,
        createdTo,
      }),
      pagination,
    );
  }

  @Get('summary')
  @RequireOrganizationPermissions(OrganizationPermission.ASSESSMENTS_READ)
  async getAssessmentSummary(
    @Param('orgId') orgId: string,
    @Query('status') status?: AssessmentStatus,
    @Query('lessonId') lessonId?: string,
    @Query('boardId') boardId?: string,
    @Query('studentId') studentId?: string,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
  ) {
    return this.assessmentService.getAssessmentSummary(
      orgId,
      this.toFilter({
        status,
        lessonId,
        boardId,
        studentId,
        createdFrom,
        createdTo,
      }),
    );
  }

  @Get(':id')
  @RequireOrganizationPermissions(OrganizationPermission.ASSESSMENTS_READ)
  async getAssessment(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
  ) {
    return this.assessmentService.getAssessment(id, orgId);
  }

  @Post(':id/items/:itemId/mark')
  @RequireOrganizationPermissions(OrganizationPermission.ASSESSMENTS_MARK)
  async applyTeacherMark(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: ApplyTeacherMarkDto,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    return this.assessmentService.applyTeacherMark(
      orgId,
      id,
      itemId,
      dto,
      user?.userId ?? 'teacher',
      correlationId,
    );
  }

  @Post(':id/finalize')
  @RequireOrganizationPermissions(OrganizationPermission.ASSESSMENTS_FINALIZE)
  async finalizeAssessment(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body('curriculumNodeId') curriculumNodeId: string | null,
    @CorrelationId() correlationId: string,
  ) {
    return this.assessmentService.finalizeAssessment(
      orgId,
      id,
      curriculumNodeId,
      correlationId,
    );
  }

  private toFilter(input: {
    status?: AssessmentStatus;
    lessonId?: string;
    boardId?: string;
    studentId?: string;
    createdFrom?: string;
    createdTo?: string;
  }) {
    return {
      ...(input.status ? { status: input.status } : {}),
      ...(input.lessonId ? { lessonId: input.lessonId } : {}),
      ...(input.boardId ? { boardId: input.boardId } : {}),
      ...(input.studentId ? { studentId: input.studentId } : {}),
      ...(input.createdFrom ? { createdFrom: new Date(input.createdFrom) } : {}),
      ...(input.createdTo ? { createdTo: new Date(input.createdTo) } : {}),
    };
  }
}
