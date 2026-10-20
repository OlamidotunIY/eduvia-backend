import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ArchiveLessonReportCommand } from './archive-lesson-report.command';
import { ArchiveLessonReportResult } from './archive-lesson-report.result';
import {
  ILessonReportRepository,
  LessonReportId,
  LessonReportNotFoundError,
} from '../../../domain';

@CommandHandler(ArchiveLessonReportCommand)
export class ArchiveLessonReportHandler
  implements ICommandHandler<ArchiveLessonReportCommand, ArchiveLessonReportResult>
{
  constructor(private readonly reportRepository: ILessonReportRepository) {}

  async execute(command: ArchiveLessonReportCommand): Promise<ArchiveLessonReportResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? 'cron';

    const report = await this.reportRepository.findById(
      LessonReportId.from(payload.reportId),
    );
    if (!report) {
      throw new LessonReportNotFoundError(payload.reportId);
    }

    report.archive(correlationId);
    await this.reportRepository.save(report);

    return {
      reportId: report.id.unpack(),
      status: report.status,
      archivedAt: report.archivedAt ?? new Date(),
    };
  }
}
