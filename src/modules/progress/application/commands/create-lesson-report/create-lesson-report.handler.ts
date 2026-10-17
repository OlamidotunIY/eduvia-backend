import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLessonReportCommand } from './create-lesson-report.command';
import { CreateLessonReportResult } from './create-lesson-report.result';
import {
  LessonReport,
  ILessonReportRepository,
  AssessmentSummary,
} from '../../../domain';

@CommandHandler(CreateLessonReportCommand)
export class CreateLessonReportHandler
  implements ICommandHandler<CreateLessonReportCommand, CreateLessonReportResult>
{
  constructor(private readonly reportRepository: ILessonReportRepository) {}

  async execute(command: CreateLessonReportCommand): Promise<CreateLessonReportResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const existing = await this.reportRepository.findByLessonId(payload.lessonId);
    if (existing) {
      return {
        reportId: existing.id.unpack(),
        lessonId: existing.lessonId,
        status: existing.status,
      };
    }

    const assessmentSummary = AssessmentSummary.create({
      totalQuestionsAttempted: payload.totalQuestionsAttempted ?? 0,
      totalQuestionsCorrect: payload.totalQuestionsCorrect ?? 0,
      totalMarksAwarded: payload.totalMarksAwarded ?? null,
      totalMaxMarks: payload.totalMaxMarks ?? 0,
      scorePercent: payload.scorePercent ?? null,
      questionBreakdown: payload.questionBreakdown || [],
    });

    const report = LessonReport.create(
      {
        lessonId: payload.lessonId,
        orgId: payload.orgId,
        classroomId: payload.classroomId,
        teacherId: payload.teacherId,
        studentId: payload.studentId,
        topicNodeIds: payload.topicNodeIds,
        attendanceStatus: payload.attendanceStatus,
        teacherNarrative: payload.teacherNarrative,
        homeworkSet: payload.homeworkSet,
        nextSteps: payload.nextSteps,
        overallRating: payload.overallRating,
        assessmentSummary,
      },
      correlationId,
    );

    await this.reportRepository.save(report);

    return {
      reportId: report.id.unpack(),
      lessonId: report.lessonId,
      status: report.status,
    };
  }
}
