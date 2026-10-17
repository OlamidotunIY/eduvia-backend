import { Injectable } from '@nestjs/common';
import {
  IProgressQueryPort,
  SharedLessonReportDto,
  SharedStudentProgressDto,
  SharedOrgAnalyticsDto,
} from '@modules/shared';
import {
  ILessonReportRepository,
  IStudentProgressSummaryRepository,
  IOrgAnalyticsSnapshotRepository,
  LessonReportId,
} from '../../domain';

@Injectable()
export class ProgressQueryAdapter implements IProgressQueryPort {
  constructor(
    private readonly reportRepository: ILessonReportRepository,
    private readonly summaryRepository: IStudentProgressSummaryRepository,
    private readonly snapshotRepository: IOrgAnalyticsSnapshotRepository,
  ) {}

  public async getLessonReportById(id: string): Promise<SharedLessonReportDto | null> {
    const report = await this.reportRepository.findById(LessonReportId.from(id));
    if (!report) return null;

    return {
      id: report.id.unpack(),
      lessonId: report.lessonId,
      orgId: report.orgId,
      classroomId: report.classroomId,
      teacherId: report.teacherId,
      studentId: report.studentId,
      status: report.status,
      topicNodeIds: [...report.topicNodeIds],
      attendanceStatus: report.attendanceStatus,
      teacherNarrative: report.teacherNarrative,
      aiGeneratedSummary: report.aiGeneratedSummary,
      teacherApprovedAiSummary: report.teacherApprovedAiSummary,
      overallRating: report.overallRating,
      parentCanView: report.parentCanView,
      scorePercent: report.assessmentSummary.scorePercent,
      submittedAt: report.submittedAt,
      archivedAt: report.archivedAt,
    };
  }

  public async getLessonReportByLessonId(
    lessonId: string,
  ): Promise<SharedLessonReportDto | null> {
    const report = await this.reportRepository.findByLessonId(lessonId);
    if (!report) return null;

    return {
      id: report.id.unpack(),
      lessonId: report.lessonId,
      orgId: report.orgId,
      classroomId: report.classroomId,
      teacherId: report.teacherId,
      studentId: report.studentId,
      status: report.status,
      topicNodeIds: [...report.topicNodeIds],
      attendanceStatus: report.attendanceStatus,
      teacherNarrative: report.teacherNarrative,
      aiGeneratedSummary: report.aiGeneratedSummary,
      teacherApprovedAiSummary: report.teacherApprovedAiSummary,
      overallRating: report.overallRating,
      parentCanView: report.parentCanView,
      scorePercent: report.assessmentSummary.scorePercent,
      submittedAt: report.submittedAt,
      archivedAt: report.archivedAt,
    };
  }

  public async getStudentProgress(
    studentId: string,
    orgId?: string,
    subjectId?: string,
  ): Promise<SharedStudentProgressDto[]> {
    if (orgId && subjectId) {
      const single = await this.summaryRepository.findByStudentAndSubject(
        studentId,
        orgId,
        subjectId,
      );
      return single ? [this.toSharedProgressDto(single)] : [];
    }

    const summaries = await this.summaryRepository.findAllByStudent(studentId, orgId);
    return summaries.map((s) => this.toSharedProgressDto(s));
  }

  public async getLatestOrgAnalytics(
    orgId: string,
  ): Promise<SharedOrgAnalyticsDto | null> {
    const snapshot = await this.snapshotRepository.findLatestByOrg(orgId);
    if (!snapshot) return null;

    return {
      id: snapshot.id.unpack(),
      orgId: snapshot.orgId,
      snapshotDate: snapshot.snapshotDate,
      totalActiveStudents: snapshot.totalActiveStudents,
      totalActiveTeachers: snapshot.totalActiveTeachers,
      avgLessonCompletionRate: snapshot.avgLessonCompletionRate,
      avgReportSubmissionTimeHours: snapshot.avgReportSubmissionTimeHours,
    };
  }

  private toSharedProgressDto(summary: any): SharedStudentProgressDto {
    return {
      id: summary.id.unpack(),
      studentId: summary.studentId,
      orgId: summary.orgId,
      subjectId: summary.subjectId,
      totalLessonsAttended: summary.totalLessonsAttended,
      totalLessonsMissed: summary.totalLessonsMissed,
      totalAssessments: summary.totalAssessments,
      averageScorePercent: summary.averageScorePercent,
      overallMasteryLevel: summary.overallMasteryLevel,
      lastLessonAt: summary.lastLessonAt,
      lastUpdatedAt: summary.lastUpdatedAt,
    };
  }
}
