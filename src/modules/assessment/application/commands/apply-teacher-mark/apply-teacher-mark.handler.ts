import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApplyTeacherMarkCommand } from './apply-teacher-mark.command';
import { ApplyTeacherMarkResult } from './apply-teacher-mark.result';
import {
  IAssessmentRepository,
  AssessmentNotFoundError,
} from '../../../domain';

@CommandHandler(ApplyTeacherMarkCommand)
export class ApplyTeacherMarkHandler
  implements ICommandHandler<ApplyTeacherMarkCommand, ApplyTeacherMarkResult>
{
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(
    command: ApplyTeacherMarkCommand,
  ): Promise<ApplyTeacherMarkResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const assessment = await this.assessmentRepository.findById(
      payload.assessmentId,
    );
    if (!assessment) {
      throw new AssessmentNotFoundError(payload.assessmentId);
    }

    assessment.applyTeacherMark(
      payload.markingItemId,
      payload.marksAwarded,
      payload.teacherId,
      payload.feedback,
      correlationId,
    );

    await this.assessmentRepository.save(assessment);

    return {
      assessmentId: assessment.id.unpack(),
      markingItemId: payload.markingItemId,
      status: assessment.status,
      scorePercent: assessment.scorePercent,
    };
  }
}
