import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApplyMasteryOverrideCommand } from './apply-mastery-override.command';
import { ApplyMasteryOverrideResult } from './apply-mastery-override.result';
import {
  MasteryRecord,
  IMasteryRecordRepository,
} from '../../../domain';

@CommandHandler(ApplyMasteryOverrideCommand)
export class ApplyMasteryOverrideHandler
  implements
    ICommandHandler<
      ApplyMasteryOverrideCommand,
      ApplyMasteryOverrideResult
    >
{
  constructor(
    private readonly masteryRecordRepository: IMasteryRecordRepository,
  ) {}

  async execute(
    command: ApplyMasteryOverrideCommand,
  ): Promise<ApplyMasteryOverrideResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    let record = await this.masteryRecordRepository.findByStudentAndNode(
      payload.studentId,
      payload.curriculumNodeId,
      payload.orgId,
    );

    if (!record) {
      record = MasteryRecord.create(
        {
          studentId: payload.studentId,
          curriculumNodeId: payload.curriculumNodeId,
          orgId: payload.orgId,
        },
        correlationId,
      );
    }

    record.applyTeacherAssessment(payload.score, correlationId);
    await this.masteryRecordRepository.save(record);

    return {
      id: record.id.unpack(),
      masteryLevel: record.masteryLevel,
    };
  }
}
