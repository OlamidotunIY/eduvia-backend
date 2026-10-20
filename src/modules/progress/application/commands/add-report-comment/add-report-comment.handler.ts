import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddReportCommentCommand } from './add-report-comment.command';
import { AddReportCommentResult } from './add-report-comment.result';
import {
  ILessonReportRepository,
  LessonReportId,
  LessonReportNotFoundError,
} from '../../../domain';

@CommandHandler(AddReportCommentCommand)
export class AddReportCommentHandler
  implements ICommandHandler<AddReportCommentCommand, AddReportCommentResult>
{
  constructor(private readonly reportRepository: ILessonReportRepository) {}

  async execute(command: AddReportCommentCommand): Promise<AddReportCommentResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? 'user';

    const report = await this.reportRepository.findById(
      LessonReportId.from(payload.reportId),
    );
    if (!report) {
      throw new LessonReportNotFoundError(payload.reportId);
    }

    const comment = report.addParentComment(
      {
        authorId: payload.authorId,
        authorRole: payload.authorRole,
        content: payload.content,
        parentCommentId: payload.parentCommentId,
      },
      correlationId,
    );

    await this.reportRepository.save(report);

    return {
      commentId: comment.id.unpack(),
      reportId: comment.reportId,
      authorId: comment.authorId,
      authorRole: comment.authorRole,
      content: comment.content,
      parentCommentId: comment.parentCommentId,
      createdAt: comment.createdAt,
    };
  }
}
