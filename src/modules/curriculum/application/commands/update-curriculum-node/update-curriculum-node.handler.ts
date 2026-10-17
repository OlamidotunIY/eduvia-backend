import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCurriculumNodeCommand } from './update-curriculum-node.command';
import { UpdateCurriculumNodeResult } from './update-curriculum-node.result';
import {
  CurriculumNodeId,
  CurriculumNodeNotFoundError,
  ICurriculumNodeRepository,
} from '../../../domain';

@CommandHandler(UpdateCurriculumNodeCommand)
export class UpdateCurriculumNodeHandler
  implements ICommandHandler<UpdateCurriculumNodeCommand, UpdateCurriculumNodeResult>
{
  constructor(private readonly nodeRepository: ICurriculumNodeRepository) {}

  async execute(command: UpdateCurriculumNodeCommand): Promise<UpdateCurriculumNodeResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const node = await this.nodeRepository.findById(CurriculumNodeId.from(payload.id));
    if (!node) {
      throw new CurriculumNodeNotFoundError(payload.id);
    }

    node.update(
      {
        name: payload.name,
        code: payload.code,
        description: payload.description,
        gradeLevel: payload.gradeLevel,
      },
      correlationId,
    );

    await this.nodeRepository.save(node);

    return {
      id: node.id.unpack(),
    };
  }
}
