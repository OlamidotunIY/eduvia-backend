import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictError } from '@modules/shared';
import { CreatePlatformSubjectCommand } from './create-platform-subject.command';
import { CreatePlatformSubjectResult } from './create-platform-subject.result';
import {
  PlatformSubject,
  IPlatformSubjectRepository,
} from '../../../domain';

@CommandHandler(CreatePlatformSubjectCommand)
export class CreatePlatformSubjectHandler
  implements ICommandHandler<CreatePlatformSubjectCommand, CreatePlatformSubjectResult>
{
  constructor(private readonly subjectRepository: IPlatformSubjectRepository) {}

  async execute(command: CreatePlatformSubjectCommand): Promise<CreatePlatformSubjectResult> {
    const { payload } = command;

    const existing = await this.subjectRepository.findByShortCode(payload.shortCode);
    if (existing) {
      throw new ConflictError(`Platform subject with short code "${payload.shortCode}" already exists.`);
    }

    const subject = PlatformSubject.create({
      name: payload.name,
      shortCode: payload.shortCode,
      description: payload.description,
      isActive: payload.isActive,
    });

    await this.subjectRepository.save(subject);

    return {
      id: subject.id.unpack(),
    };
  }
}
