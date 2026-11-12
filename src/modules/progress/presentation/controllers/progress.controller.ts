import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  OrganizationPermissionGuard,
  RequireOrganizationPermissions,
  type CurrentUserPayload,
} from '@modules/shared';
import { ProgressService } from '../services/progress.service';
import {
  CreateLessonReportDto,
  UpdateLessonReportDto,
  ApproveAiSummaryDto,
  AddReportCommentDto,
  OrgAnalyticsResponseDTO,
  StudentChurnRiskDTO,
  TeacherPerformanceDTO,
} from '../dto';
import { CommentAuthorRole } from '../../domain';
import { OrganizationPermission } from '../../../org/domain';

@ApiTags('Progress & Analytics')
@Controller()
@UseGuards(AuthGuard, OrganizationPermissionGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('orgs/:orgId/lessons/:lessonId/report')
  @RequireOrganizationPermissions(OrganizationPermission.REPORTS_READ)
  async getLessonReportByLesson(
    @Param('orgId') orgId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const requesterRole = user?.role === 'parent' ? 'parent' : 'teacher';
    return this.progressService.getReportByLesson(lessonId, requesterRole);
  }

  @Get('orgs/:orgId/reports/:reportId')
  @RequireOrganizationPermissions(OrganizationPermission.REPORTS_READ)
  async getLessonReport(
    @Param('orgId') orgId: string,
    @Param('reportId') reportId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const requesterRole = user?.role === 'parent' ? 'parent' : 'teacher';
    return this.progressService.getReport(reportId, requesterRole);
  }

  @Post('orgs/:orgId/reports')
  @RequireOrganizationPermissions(OrganizationPermission.REPORTS_CREATE)
  async createReport(
    @Param('orgId') orgId: string,
    @Body() dto: CreateLessonReportDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.progressService.createReport(orgId, dto, correlationId);
  }

  @Patch('orgs/:orgId/reports/:reportId')
  @RequireOrganizationPermissions(OrganizationPermission.REPORTS_UPDATE)
  async updateReport(
    @Param('orgId') orgId: string,
    @Param('reportId') reportId: string,
    @Body() dto: UpdateLessonReportDto,
  ) {
    return this.progressService.updateReport(reportId, dto);
  }

  @Post('orgs/:orgId/reports/:reportId/approve-ai')
  @RequireOrganizationPermissions(OrganizationPermission.REPORTS_APPROVE_AI)
  async approveAiSummary(
    @Param('orgId') orgId: string,
    @Param('reportId') reportId: string,
    @Body() dto: ApproveAiSummaryDto,
  ) {
    return this.progressService.approveAiSummary(reportId, dto);
  }

  @Post('orgs/:orgId/reports/:reportId/submit')
  @RequireOrganizationPermissions(OrganizationPermission.REPORTS_SUBMIT)
  async submitReport(
    @Param('orgId') orgId: string,
    @Param('reportId') reportId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.progressService.submitReport(reportId, correlationId);
  }

  @Post('orgs/:orgId/reports/:reportId/comments')
  @RequireOrganizationPermissions(OrganizationPermission.REPORTS_UPDATE)
  async addComment(
    @Param('orgId') orgId: string,
    @Param('reportId') reportId: string,
    @Body() dto: AddReportCommentDto,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    const authorRole =
      user?.role === 'parent' ? CommentAuthorRole.parent : CommentAuthorRole.admin;
    const authorId = user?.userId ?? 'anonymous';
    return this.progressService.addComment(
      reportId,
      authorId,
      authorRole,
      dto,
      correlationId,
    );
  }

  @Get('students/:studentId/progress')
  async getStudentProgress(
    @Param('studentId') studentId: string,
    @Query('orgId') orgId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.progressService.getStudentProgress(studentId, orgId, subjectId);
  }

  @Get('students/:studentId/mastery-graph')
  async getStudentMasteryGraph(
    @Param('studentId') studentId: string,
    @Query('orgId') orgId?: string,
  ) {
    return this.progressService.getStudentMasteryGraph(studentId, orgId);
  }

  @Get('students/:studentId/lesson-history')
  async getStudentLessonHistory(
    @Param('studentId') studentId: string,
    @Query('orgId') orgId?: string,
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
    return this.progressService.getStudentLessonHistory(studentId, orgId, pagination);
  }

  @Get('orgs/:orgId/analytics')
  @RequireOrganizationPermissions(OrganizationPermission.ANALYTICS_READ)
  @ApiOkResponse({ type: OrgAnalyticsResponseDTO })
  async getOrgAnalytics(
    @Param('orgId') orgId: string,
    @Query('date') dateStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : undefined;
    return this.progressService.getOrgAnalytics(orgId, date);
  }

  @Get('orgs/:orgId/analytics/churn-risk')
  @RequireOrganizationPermissions(OrganizationPermission.ANALYTICS_READ)
  @ApiOkResponse({ type: [StudentChurnRiskDTO] })
  async getStudentChurnRisk(@Param('orgId') orgId: string) {
    return this.progressService.getStudentChurnRisk(orgId);
  }

  @Get('orgs/:orgId/analytics/teacher-performance')
  @RequireOrganizationPermissions(OrganizationPermission.ANALYTICS_READ)
  @ApiOkResponse({ type: [TeacherPerformanceDTO] })
  async getTeacherPerformance(@Param('orgId') orgId: string) {
    return this.progressService.getTeacherPerformance(orgId);
  }

  @Get('orgs/:orgId/progress/students')
  @RequireOrganizationPermissions(OrganizationPermission.PROGRESS_READ)
  async getOrgStudentsProgress(
    @Param('orgId') orgId: string,
    @Query('classroomId') classroomId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('search') search?: string,
    @Query('masteryTier') masteryTier?: string,
  ) {
    return this.progressService.getOrgStudentsProgress(orgId, {
      classroomId,
      subjectId,
      search,
      masteryTier,
    });
  }

  @Get('orgs/:orgId/students/progress')
  @RequireOrganizationPermissions(OrganizationPermission.PROGRESS_READ)
  async getOrgStudentsProgressAlias(
    @Param('orgId') orgId: string,
    @Query('classroomId') classroomId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('search') search?: string,
    @Query('masteryTier') masteryTier?: string,
  ) {
    return this.progressService.getOrgStudentsProgress(orgId, {
      classroomId,
      subjectId,
      search,
      masteryTier,
    });
  }
}
