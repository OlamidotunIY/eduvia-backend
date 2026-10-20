import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCurriculumNodeCommand } from './create-curriculum-node.command';
import { CreateCurriculumNodeResult } from './create-curriculum-node.result';
import {
  CurriculumNode,
  CurriculumNodeId,
  CurriculumNodeNotFoundError,
  CurriculumProfileId,
  CurriculumProfileNotFoundError,
  ICurriculumNodeRepository,
  ICurriculumProfileRepository,
} from '../../../domain';

@CommandHandler(CreateCurriculumNodeCommand)
export class CreateCurriculumNodeHandler
  implements ICommandHandler<CreateCurriculumNodeCommand, CreateCurriculumNodeResult>
{
  constructor(
    private readonly profileRepository: ICurriculumProfileRepository,
    private readonly nodeRepository: ICurriculumNodeRepository,
  ) {}

  async execute(command: CreateCurriculumNodeCommand): Promise<CreateCurriculumNodeResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const profile = await this.profileRepository.findById(CurriculumProfileId.from(payload.curriculumId));
    if (!profile) {
      throw new CurriculumProfileNotFoundError(payload.curriculumId);
    }

    let parentNode: CurriculumNode | null = null;
    if (payload.parentNodeId) {
      parentNode = await this.nodeRepository.findById(CurriculumNodeId.from(payload.parentNodeId));
      if (!parentNode) {
        throw new CurriculumNodeNotFoundError(payload.parentNodeId);
      }
    }

    const node = CurriculumNode.create(
      {
        curriculumId: profile.id,
        parent: parentNode,
        nodeType: payload.nodeType,
        name: payload.name,
        code: payload.code,
        description: payload.description,
        gradeLevel: payload.gradeLevel,
        isActive: payload.isActive,
      },
      correlationId,
    );

    await this.nodeRepository.save(node);

    return {
      id: node.id.unpack(),
      depth: node.depth,
      path: node.path.value,
      isLeaf: node.isLeaf,
    };
  }
}
