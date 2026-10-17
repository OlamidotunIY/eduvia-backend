import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCurriculumProfileCommand } from './create-curriculum-profile.command';
import { CreateCurriculumProfileResult } from './create-curriculum-profile.result';
import {
  CurriculumProfile,
  DuplicateCurriculumCodeError,
  ICurriculumProfileRepository,
} from '../../../domain';

@CommandHandler(CreateCurriculumProfileCommand)
export class CreateCurriculumProfileHandler
  implements ICommandHandler<CreateCurriculumProfileCommand, CreateCurriculumProfileResult>
{
  constructor(private readonly profileRepository: ICurriculumProfileRepository) {}

  async execute(command: CreateCurriculumProfileCommand): Promise<CreateCurriculumProfileResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const existing = await this.profileRepository.findByShortCode(payload.shortCode);
    if (existing) {
      throw new DuplicateCurriculumCodeError(payload.shortCode);
    }

    const profile = CurriculumProfile.create(
      {
        name: payload.name,
        shortCode: payload.shortCode,
        countryCode: payload.countryCode,
        description: payload.description,
        authority: payload.authority,
        version: payload.version,
        isActive: payload.isActive,
      },
      correlationId,
    );

    await this.profileRepository.save(profile);

    return {
      id: profile.id.unpack(),
    };
  }
}
