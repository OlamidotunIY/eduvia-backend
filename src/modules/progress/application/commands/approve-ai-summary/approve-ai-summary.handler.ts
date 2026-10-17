import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApproveAiSummaryCommand } from './approve-ai-summary.command';
import { ApproveAiSummaryResult } from './approve-ai-summary.result';
import {
  ILessonReportRepository,
  LessonReportId,
  LessonReportNotFoundError,
} from '../../../domain';

@CommandHandler(ApproveAiSummaryCommand)
export class ApproveAiSummaryHandler
  implements ICommandHandler<ApproveAiSummaryCommand, ApproveAiSummaryResult>
{
  constructor(private readonly reportRepository: ILessonReportRepository) {}

  async execute(command: ApproveAiSummaryCommand): Promise<ApproveAiSummaryResult> {
    const { payload } = command;

    const report = await this.reportRepository.findById(
      LessonReportId.from(payload.reportId),
    );
    if (!report) {
      throw new LessonReportNotFoundError(payload.reportId);
    }

    report.approveAiSummary(payload.editedSummary);
    await this.reportRepository.save(report);

    return {
      reportId: report.id.unpack(),
      teacherApprovedAiSummary: report.teacherApprovedAiSummary || '',
      status: report.status,
    };
  }
}
