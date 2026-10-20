import { Injectable, Optional, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateLessonReportCommand,
  ApproveAiSummaryCommand,
  UpdateLessonReportCommand,
  SubmitLessonReportCommand,
  ArchiveLessonReportCommand,
  AddReportCommentCommand,
} from '../../application/commands';
import {
  GetLessonReportQuery,
  GetLessonReportByLessonQuery,
  GetStudentProgressQuery,
  GetStudentLessonHistoryQuery,
  GetOrgAnalyticsQuery,
  GetStudentChurnRiskQuery,
  GetTeacherPerformanceQuery,
} from '../../application/queries';
import {
  CreateLessonReportDto,
  UpdateLessonReportDto,
  ApproveAiSummaryDto,
  AddReportCommentDto,
} from '../dto';
import { CommentAuthorRole } from '../../domain';
import { IAssessmentQueryPort } from '@modules/shared';

@Injectable()
export class ProgressService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Optional()
    @Inject(IAssessmentQueryPort)
    private readonly assessmentQueryPort?: IAssessmentQueryPort,
  ) {}

  async createReport(
    orgId: string,
    dto: CreateLessonReportDto,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new CreateLessonReportCommand({
        lessonId: dto.lessonId,
        orgId,
        classroomId: dto.classroomId,
        teacherId: dto.teacherId,
        studentId: dto.studentId,
        topicNodeIds: dto.topicNodeIds,
        attendanceStatus: dto.attendanceStatus,
        teacherNarrative: dto.teacherNarrative,
        homeworkSet: dto.homeworkSet,
        nextSteps: dto.nextSteps,
        overallRating: dto.overallRating,
        correlationId,
      }),
    );
  }

  async getReport(reportId: string, requesterRole?: 'teacher' | 'parent' | 'admin') {
    return this.queryBus.execute(new GetLessonReportQuery(reportId, requesterRole));
  }

  async getReportByLesson(
    lessonId: string,
    requesterRole?: 'teacher' | 'parent' | 'admin',
  ) {
    return this.queryBus.execute(
      new GetLessonReportByLessonQuery(lessonId, requesterRole),
    );
  }

  async updateReport(reportId: string, dto: UpdateLessonReportDto) {
    return this.commandBus.execute(
      new UpdateLessonReportCommand({
        reportId,
        teacherNarrative: dto.teacherNarrative,
        topicNodeIds: dto.topicNodeIds,
        attendanceStatus: dto.attendanceStatus,
        homeworkSet: dto.homeworkSet,
        nextSteps: dto.nextSteps,
        overallRating: dto.overallRating,
      }),
    );
  }

  async approveAiSummary(reportId: string, dto: ApproveAiSummaryDto) {
    return this.commandBus.execute(
      new ApproveAiSummaryCommand({
        reportId,
        editedSummary: dto.editedSummary,
      }),
    );
  }

  async submitReport(reportId: string, correlationId?: string) {
    return this.commandBus.execute(
      new SubmitLessonReportCommand({
        reportId,
        correlationId,
      }),
    );
  }

  async archiveReport(reportId: string, correlationId?: string) {
    return this.commandBus.execute(
      new ArchiveLessonReportCommand({
        reportId,
        correlationId,
      }),
    );
  }

  async addComment(
    reportId: string,
    authorId: string,
    authorRole: CommentAuthorRole,
    dto: AddReportCommentDto,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new AddReportCommentCommand({
        reportId,
        authorId,
        authorRole,
        content: dto.content,
        parentCommentId: dto.parentCommentId,
        correlationId,
      }),
    );
  }

  async getStudentProgress(studentId: string, orgId?: string, subjectId?: string) {
    return this.queryBus.execute(
      new GetStudentProgressQuery(studentId, orgId, subjectId),
    );
  }

  async getStudentMasteryGraph(studentId: string, orgId?: string) {
    if (this.assessmentQueryPort) {
      return this.assessmentQueryPort.getStudentMasteryList(studentId, orgId);
    }
    return [];
  }

  async getStudentLessonHistory(
    studentId: string,
    orgId?: string,
    pagination?: { skip?: number; take?: number },
  ) {
    return this.queryBus.execute(
      new GetStudentLessonHistoryQuery(studentId, orgId, pagination),
    );
  }

  async getOrgAnalytics(orgId: string, date?: Date) {
    return this.queryBus.execute(new GetOrgAnalyticsQuery(orgId, date));
  }

  async getStudentChurnRisk(orgId: string) {
    return this.queryBus.execute(new GetStudentChurnRiskQuery(orgId));
  }

  async getTeacherPerformance(orgId: string) {
    return this.queryBus.execute(new GetTeacherPerformanceQuery(orgId));
  }
}
