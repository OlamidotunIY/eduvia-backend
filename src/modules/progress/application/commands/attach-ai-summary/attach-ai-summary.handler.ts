import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AttachAiSummaryCommand } from './attach-ai-summary.command';
import { AttachAiSummaryResult } from './attach-ai-summary.result';
import {
  ILessonReportRepository,
  LessonReportId,
  LessonReportNotFoundError,
} from '../../../domain';

@CommandHandler(AttachAiSummaryCommand)
export class AttachAiSummaryHandler
  implements ICommandHandler<AttachAiSummaryCommand, AttachAiSummaryResult>
{
  constructor(private readonly reportRepository: ILessonReportRepository) {}

  async execute(command: AttachAiSummaryCommand): Promise<AttachAiSummaryResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? 'ai-worker';

    const report = await this.reportRepository.findById(
      LessonReportId.from(payload.reportId),
    );
    if (!report) {
      throw new LessonReportNotFoundError(payload.reportId);
    }

    report.attachAiSummary(payload.aiGeneratedSummary, correlationId);
    await this.reportRepository.save(report);

    return {
      reportId: report.id.unpack(),
      status: report.status,
    };
  }
}
