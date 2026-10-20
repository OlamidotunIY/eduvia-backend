import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLessonReportCommand } from './update-lesson-report.command';
import { UpdateLessonReportResult } from './update-lesson-report.result';
import {
  ILessonReportRepository,
  LessonReportId,
  LessonReportNotFoundError,
} from '../../../domain';

@CommandHandler(UpdateLessonReportCommand)
export class UpdateLessonReportHandler
  implements ICommandHandler<UpdateLessonReportCommand, UpdateLessonReportResult>
{
  constructor(private readonly reportRepository: ILessonReportRepository) {}

  async execute(command: UpdateLessonReportCommand): Promise<UpdateLessonReportResult> {
    const { payload } = command;

    const report = await this.reportRepository.findById(
      LessonReportId.from(payload.reportId),
    );
    if (!report) {
      throw new LessonReportNotFoundError(payload.reportId);
    }

    if (payload.teacherNarrative !== undefined) {
      report.updateNarrative(payload.teacherNarrative);
    }

    report.updateDetails({
      topicNodeIds: payload.topicNodeIds,
      attendanceStatus: payload.attendanceStatus,
      homeworkSet: payload.homeworkSet,
      nextSteps: payload.nextSteps,
      overallRating: payload.overallRating,
    });

    await this.reportRepository.save(report);

    return {
      reportId: report.id.unpack(),
      status: report.status,
    };
  }
}
