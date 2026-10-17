import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FinalizeAssessmentCommand } from './finalize-assessment.command';
import { FinalizeAssessmentResult } from './finalize-assessment.result';
import {
  IAssessmentRepository,
  AssessmentNotFoundError,
} from '../../../domain';

@CommandHandler(FinalizeAssessmentCommand)
export class FinalizeAssessmentHandler
  implements
    ICommandHandler<FinalizeAssessmentCommand, FinalizeAssessmentResult>
{
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(
    command: FinalizeAssessmentCommand,
  ): Promise<FinalizeAssessmentResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const assessment = await this.assessmentRepository.findById(
      payload.assessmentId,
    );
    if (!assessment) {
      throw new AssessmentNotFoundError(payload.assessmentId);
    }

    assessment.finalizeMarking(payload.curriculumNodeId, correlationId);
    await this.assessmentRepository.save(assessment);

    return {
      id: assessment.id.unpack(),
      status: assessment.status,
      scorePercent: assessment.scorePercent,
    };
  }
}
