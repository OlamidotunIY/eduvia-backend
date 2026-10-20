import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictError } from '@modules/shared';
import { CreateSubjectCurriculumMappingCommand } from './create-subject-curriculum-mapping.command';
import { CreateSubjectCurriculumMappingResult } from './create-subject-curriculum-mapping.result';
import {
  CurriculumNodeId,
  CurriculumNodeNotFoundError,
  CurriculumProfileId,
  CurriculumProfileNotFoundError,
  ICurriculumNodeRepository,
  ICurriculumProfileRepository,
  InvalidNodeDepthError,
  IPlatformSubjectRepository,
  ISubjectCurriculumMappingRepository,
  NodeType,
  PlatformSubjectId,
  PlatformSubjectNotFoundError,
  SubjectCurriculumMapping,
} from '../../../domain';

@CommandHandler(CreateSubjectCurriculumMappingCommand)
export class CreateSubjectCurriculumMappingHandler
  implements ICommandHandler<CreateSubjectCurriculumMappingCommand, CreateSubjectCurriculumMappingResult>
{
  constructor(
    private readonly subjectRepository: IPlatformSubjectRepository,
    private readonly profileRepository: ICurriculumProfileRepository,
    private readonly nodeRepository: ICurriculumNodeRepository,
    private readonly mappingRepository: ISubjectCurriculumMappingRepository,
  ) {}

  async execute(command: CreateSubjectCurriculumMappingCommand): Promise<CreateSubjectCurriculumMappingResult> {
    const { payload } = command;

    const subject = await this.subjectRepository.findById(PlatformSubjectId.from(payload.platformSubjectId));
    if (!subject) {
      throw new PlatformSubjectNotFoundError(payload.platformSubjectId);
    }

    const profile = await this.profileRepository.findById(CurriculumProfileId.from(payload.curriculumId));
    if (!profile) {
      throw new CurriculumProfileNotFoundError(payload.curriculumId);
    }

    const node = await this.nodeRepository.findById(CurriculumNodeId.from(payload.subjectNodeId));
    if (!node) {
      throw new CurriculumNodeNotFoundError(payload.subjectNodeId);
    }

    if (node.nodeType !== NodeType.subject) {
      throw new InvalidNodeDepthError(
        `Curriculum node "${payload.subjectNodeId}" is not a subject node (type is "${node.nodeType}").`,
      );
    }

    const existing = await this.mappingRepository.findBySubjectAndCurriculum(
      payload.platformSubjectId,
      payload.curriculumId,
    );
    if (existing) {
      throw new ConflictError(
        `Mapping for subject "${payload.platformSubjectId}" and curriculum "${payload.curriculumId}" already exists.`,
      );
    }

    const mapping = SubjectCurriculumMapping.create({
      platformSubjectId: payload.platformSubjectId,
      curriculumId: payload.curriculumId,
      subjectNodeId: payload.subjectNodeId,
    });

    await this.mappingRepository.save(mapping);

    return {
      id: mapping.id.unpack(),
    };
  }
}
