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
      user?.userId ?? 'teacher',
      correlationId,
    );
  }

  @Post(':id/finalize')
  @RequireOrganizationPermissions(OrganizationPermission.ASSESSMENTS_FINALIZE)
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
