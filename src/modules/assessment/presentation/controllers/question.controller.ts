import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  OrganizationPermissionGuard,
  RequireOrganizationPermissions,
  type CurrentUserPayload,
} from '@modules/shared';
import { AssessmentService } from '../services/assessment.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  SearchQuestionsDto,
} from '../dto';
import { OrganizationPermission } from '../../../org/domain';
import { QuestionOwnerType, ProvenanceSource } from '../../domain';

@Controller('questions')
@UseGuards(AuthGuard, OrganizationPermissionGuard)
export class QuestionController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  @RequireOrganizationPermissions(OrganizationPermission.QUESTIONS_CREATE)
  async createQuestion(
    @Body() dto: CreateQuestionDto,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
    @Req() req: Request,
  ) {
    const orgId = this.extractOrgId(req, dto.orgId ?? undefined);

    // Enforce trusted ownership server-side
    if (user.userType !== 'SUPER_ADMIN') {
      dto.ownerType = QuestionOwnerType.org;
      dto.orgId = orgId;
      dto.provenance = {
        ...dto.provenance,
        createdBy: user.userId,
        source: dto.provenance?.source ?? ProvenanceSource.manual,
      };
    }

    return this.assessmentService.createQuestion(
      dto,
      {
        orgId,
        userId: user.userId,
        role: user.userType,
      },
      correlationId,
    );
  }

  @Get('summary')
  @RequireOrganizationPermissions(OrganizationPermission.QUESTIONS_READ)
  async getQuestionSummary(
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: Request,
  ) {
    const orgId = this.extractOrgId(req);
    return this.assessmentService.getQuestionSummary(orgId, user?.userId);
  }

  @Get()
  @RequireOrganizationPermissions(OrganizationPermission.QUESTIONS_READ)
  async searchQuestions(
    @Query() dto: SearchQuestionsDto,
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: Request,
  ) {
    const orgId = this.extractOrgId(req, dto.orgId);
    return this.assessmentService.searchQuestions(dto, {
      orgId,
      userId: user?.userId,
      role: user?.userType,
    });
  }

  @Get(':id')
  @RequireOrganizationPermissions(OrganizationPermission.QUESTIONS_READ)
  async getQuestion(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: Request,
  ) {
    const orgId = this.extractOrgId(req);
    return this.assessmentService.getQuestion(id, {
      orgId,
      role: user?.userType,
    });
  }

  @Patch(':id')
  @RequireOrganizationPermissions(OrganizationPermission.QUESTIONS_UPDATE)
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: Request,
  ) {
    const orgId = this.extractOrgId(req);
    return this.assessmentService.updateQuestion(id, dto, {
      role: user?.userType ?? 'TEACHER',
      userId: user?.userId,
      orgId,
    });
  }

  @Post(':id/publish')
  @RequireOrganizationPermissions(OrganizationPermission.QUESTIONS_PUBLISH)
  async publishQuestion(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
    @Req() req: Request,
  ) {
    const orgId = this.extractOrgId(req);
    return this.assessmentService.publishQuestion(
      id,
      {
        role: user?.userType ?? 'TEACHER',
        userId: user?.userId,
        orgId,
      },
      correlationId,
    );
  }

  @Post(':id/unpublish')
  @RequireOrganizationPermissions(OrganizationPermission.QUESTIONS_PUBLISH)
  async unpublishQuestion(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: Request,
  ) {
    const orgId = this.extractOrgId(req);
    return this.assessmentService.unpublishQuestion(id, {
      role: user?.userType ?? 'TEACHER',
      userId: user?.userId,
      orgId,
    });
  }

  @Delete(':id')
  @RequireOrganizationPermissions(OrganizationPermission.QUESTIONS_DELETE)
  async deleteQuestion(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: Request,
  ) {
    const orgId = this.extractOrgId(req);
    return this.assessmentService.deleteQuestion(id, {
      role: user?.userType ?? 'TEACHER',
      userId: user?.userId,
      orgId,
    });
  }

  private extractOrgId(req: Request, fallback?: string): string {
    const reqAny = req as any;
    return (
      reqAny.organizationId ??
      (req.params?.organizationId as string | undefined) ??
      (req.params?.orgId as string | undefined) ??
      (req.query?.orgId as string | undefined) ??
      (req.headers['x-organization-id'] as string | undefined) ??
      (req.headers['x-org-id'] as string | undefined) ??
      fallback
    );
  }
}
