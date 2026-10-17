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
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';
import { ProgressService } from '../services/progress.service';
import {
  CreateLessonReportDto,
  UpdateLessonReportDto,
  ApproveAiSummaryDto,
  AddReportCommentDto,
} from '../dto';
import { CommentAuthorRole } from '../../domain';

@Controller()
@UseGuards(AuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('orgs/:orgId/lessons/:lessonId/report')
  async getLessonReportByLesson(
    @Param('orgId') orgId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const requesterRole = user?.role === 'parent' ? 'parent' : 'teacher';
    return this.progressService.getReportByLesson(lessonId, requesterRole);
  }

  @Get('orgs/:orgId/reports/:reportId')
  async getLessonReport(
    @Param('orgId') orgId: string,
    @Param('reportId') reportId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const requesterRole = user?.role === 'parent' ? 'parent' : 'teacher';
    return this.progressService.getReport(reportId, requesterRole);
  }

  @Post('orgs/:orgId/reports')
  async createReport(
    @Param('orgId') orgId: string,
    @Body() dto: CreateLessonReportDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.progressService.createReport(orgId, dto, correlationId);
  }

  @Patch('orgs/:orgId/reports/:reportId')
  async updateReport(
    @Param('orgId') orgId: string,
    @Param('reportId') reportId: string,
    @Body() dto: UpdateLessonReportDto,
  ) {
    return this.progressService.updateReport(reportId, dto);
  }

  @Post('orgs/:orgId/reports/:reportId/approve-ai')
  async approveAiSummary(
    @Param('orgId') orgId: string,
    @Param('reportId') reportId: string,
    @Body() dto: ApproveAiSummaryDto,
  ) {
    return this.progressService.approveAiSummary(reportId, dto);
  }

  @Post('orgs/:orgId/reports/:reportId/submit')
  async submitReport(
    @Param('orgId') orgId: string,
    @Param('reportId') reportId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.progressService.submitReport(reportId, correlationId);
  }

  @Post('orgs/:orgId/reports/:reportId/comments')
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
  async getOrgAnalytics(
    @Param('orgId') orgId: string,
    @Query('date') dateStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : undefined;
    return this.progressService.getOrgAnalytics(orgId, date);
  }

  @Get('orgs/:orgId/analytics/churn-risk')
  async getStudentChurnRisk(@Param('orgId') orgId: string) {
    return this.progressService.getStudentChurnRisk(orgId);
  }

  @Get('orgs/:orgId/analytics/teacher-performance')
  async getTeacherPerformance(@Param('orgId') orgId: string) {
    return this.progressService.getTeacherPerformance(orgId);
  }
}
