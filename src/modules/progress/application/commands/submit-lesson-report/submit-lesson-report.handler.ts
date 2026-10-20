import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubmitLessonReportCommand } from './submit-lesson-report.command';
import { SubmitLessonReportResult } from './submit-lesson-report.result';
import {
  ILessonReportRepository,
  LessonReportId,
  LessonReportNotFoundError,
} from '../../../domain';

@CommandHandler(SubmitLessonReportCommand)
export class SubmitLessonReportHandler
  implements ICommandHandler<SubmitLessonReportCommand, SubmitLessonReportResult>
{
  constructor(private readonly reportRepository: ILessonReportRepository) {}

  async execute(command: SubmitLessonReportCommand): Promise<SubmitLessonReportResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? 'teacher';

    const report = await this.reportRepository.findById(
      LessonReportId.from(payload.reportId),
    );
    if (!report) {
      throw new LessonReportNotFoundError(payload.reportId);
    }

    report.submit(correlationId);
    await this.reportRepository.save(report);

    return {
      reportId: report.id.unpack(),
      status: report.status,
      parentCanView: report.parentCanView,
      submittedAt: report.submittedAt ?? new Date(),
    };
  }
}
