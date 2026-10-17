import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeactivateCurriculumNodeCommand } from './deactivate-curriculum-node.command';
import { DeactivateCurriculumNodeResult } from './deactivate-curriculum-node.result';
import {
  CurriculumNodeId,
  CurriculumNodeNotFoundError,
  ICurriculumNodeRepository,
} from '../../../domain';

@CommandHandler(DeactivateCurriculumNodeCommand)
export class DeactivateCurriculumNodeHandler
  implements ICommandHandler<DeactivateCurriculumNodeCommand, DeactivateCurriculumNodeResult>
{
  constructor(private readonly nodeRepository: ICurriculumNodeRepository) {}

  async execute(command: DeactivateCurriculumNodeCommand): Promise<DeactivateCurriculumNodeResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const node = await this.nodeRepository.findById(CurriculumNodeId.from(payload.id));
    if (!node) {
      throw new CurriculumNodeNotFoundError(payload.id);
    }

    node.deactivate(correlationId);
    await this.nodeRepository.save(node);

    return {
      id: node.id.unpack(),
      isActive: node.isActive,
    };
  }
}
