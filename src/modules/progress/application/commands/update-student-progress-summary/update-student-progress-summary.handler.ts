import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateStudentProgressSummaryCommand } from './update-student-progress-summary.command';
import { UpdateStudentProgressSummaryResult } from './update-student-progress-summary.result';
import {
  StudentProgressSummary,
  IStudentProgressSummaryRepository,
} from '../../../domain';

@CommandHandler(UpdateStudentProgressSummaryCommand)
export class UpdateStudentProgressSummaryHandler
  implements
    ICommandHandler<
      UpdateStudentProgressSummaryCommand,
      UpdateStudentProgressSummaryResult
    >
{
  constructor(
    private readonly summaryRepository: IStudentProgressSummaryRepository,
  ) {}

  async execute(
    command: UpdateStudentProgressSummaryCommand,
  ): Promise<UpdateStudentProgressSummaryResult> {
    const { payload } = command;

    let summary = await this.summaryRepository.findByStudentAndSubject(
      payload.studentId,
      payload.orgId,
      payload.subjectId,
    );

    if (!summary) {
      summary = StudentProgressSummary.create({
        studentId: payload.studentId,
        orgId: payload.orgId,
        subjectId: payload.subjectId,
        totalLessonsAttended: payload.totalLessonsAttended,
        totalLessonsMissed: payload.totalLessonsMissed,
        totalAssessments: payload.totalAssessments,
        averageScorePercent: payload.averageScorePercent,
        masteredTopicsCount: payload.masteredTopicsCount,
        inProgressTopicsCount: payload.inProgressTopicsCount,
        notStartedTopicsCount: payload.notStartedTopicsCount,
        overallMasteryLevel: payload.overallMasteryLevel,
        lastLessonAt: payload.lastLessonAt,
      });
    } else {
      summary.updateMetrics({
        totalLessonsAttended: payload.totalLessonsAttended,
        totalLessonsMissed: payload.totalLessonsMissed,
        totalAssessments: payload.totalAssessments,
        averageScorePercent: payload.averageScorePercent,
        masteredTopicsCount: payload.masteredTopicsCount,
        inProgressTopicsCount: payload.inProgressTopicsCount,
        notStartedTopicsCount: payload.notStartedTopicsCount,
        overallMasteryLevel: payload.overallMasteryLevel,
        lastLessonAt: payload.lastLessonAt,
      });
    }

    await this.summaryRepository.save(summary);

    return {
      summaryId: summary.id.unpack(),
      studentId: summary.studentId,
      subjectId: summary.subjectId,
      overallMasteryLevel: summary.overallMasteryLevel,
    };
  }
}
