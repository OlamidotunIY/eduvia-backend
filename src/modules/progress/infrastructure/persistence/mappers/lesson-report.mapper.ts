import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  LessonReport,
  LessonReportId,
  ReportStatus,
  AttendanceStatus,
  AssessmentSummary,
  QuestionSummary,
} from '../../../domain';
import {
  LessonReport as PrismaLessonReport,
  ReportComment as PrismaReportComment,
} from '@generated/prisma/client';
import { ReportCommentMapper } from './report-comment.mapper';

@Injectable()
export class LessonReportMapper implements IMapper<LessonReport, PrismaLessonReport> {
  constructor(private readonly commentMapper: ReportCommentMapper) {}

  toDomain(
    record: PrismaLessonReport & { comments?: PrismaReportComment[] },
  ): LessonReport {
    const comments = record.comments
      ? record.comments.map((c) => this.commentMapper.toDomain(c))
      : [];

    const rawBreakdown = Array.isArray(record.questionBreakdown)
      ? (record.questionBreakdown as any[])
      : [];
    const questionBreakdown = rawBreakdown.map((q) =>
      QuestionSummary.create({
        questionId: q.questionId,
        questionStem: q.questionStem,
        questionType: q.questionType,
        marksAwarded: q.marksAwarded ?? null,
        maxMarks: q.maxMarks,
        isCorrect: q.isCorrect ?? null,
        teacherFeedback: q.teacherFeedback ?? null,
      }),
    );

    const assessmentSummary = AssessmentSummary.create({
      totalQuestionsAttempted: record.totalQuestionsAttempted,
      totalQuestionsCorrect: record.totalQuestionsCorrect,
      totalMarksAwarded: record.totalMarksAwarded,
      totalMaxMarks: record.totalMaxMarks,
      scorePercent: record.scorePercent,
      questionBreakdown,
    });

    const topicNodeIds = Array.isArray(record.topicNodeIds)
      ? (record.topicNodeIds as string[])
      : [];

    return LessonReport.reconstitute({
      id: LessonReportId.from(record.id),
      lessonId: record.lessonId,
      orgId: record.orgId,
      classroomId: record.classroomId,
      teacherId: record.teacherId,
      studentId: record.studentId,
      status: record.status as ReportStatus,
      topicNodeIds,
      attendanceStatus: record.attendanceStatus as AttendanceStatus,
      teacherNarrative: record.teacherNarrative,
      aiGeneratedSummary: record.aiGeneratedSummary,
      teacherApprovedAiSummary: record.teacherApprovedAiSummary,
      homeworkSet: record.homeworkSet,
      nextSteps: record.nextSteps,
      overallRating: record.overallRating,
      parentCanView: record.parentCanView,
      assessmentSummary,
      comments,
      submittedAt: record.submittedAt,
      archivedAt: record.archivedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: LessonReport): Omit<PrismaLessonReport, 'id'> {
    const summary = entity.assessmentSummary;
    const questionBreakdown = summary.questionBreakdown.map((q) => q.toJSON());

    return {
      lessonId: entity.lessonId,
      orgId: entity.orgId,
      classroomId: entity.classroomId,
      teacherId: entity.teacherId,
      studentId: entity.studentId,
      status: entity.status as any,
      topicNodeIds: [...entity.topicNodeIds] as any,
      attendanceStatus: entity.attendanceStatus as any,
      teacherNarrative: entity.teacherNarrative,
      aiGeneratedSummary: entity.aiGeneratedSummary,
      teacherApprovedAiSummary: entity.teacherApprovedAiSummary,
      homeworkSet: entity.homeworkSet,
      nextSteps: entity.nextSteps,
      overallRating: entity.overallRating,
      parentCanView: entity.parentCanView,
      totalQuestionsAttempted: summary.totalQuestionsAttempted,
      totalQuestionsCorrect: summary.totalQuestionsCorrect,
      totalMarksAwarded: summary.totalMarksAwarded,
      totalMaxMarks: summary.totalMaxMarks,
      scorePercent: summary.scorePercent,
      questionBreakdown: questionBreakdown as any,
      submittedAt: entity.submittedAt,
      archivedAt: entity.archivedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
