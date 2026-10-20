import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCurriculumProfileCommand } from './update-curriculum-profile.command';
import { UpdateCurriculumProfileResult } from './update-curriculum-profile.result';
import {
  CurriculumProfileId,
  CurriculumProfileNotFoundError,
  ICurriculumProfileRepository,
} from '../../../domain';

@CommandHandler(UpdateCurriculumProfileCommand)
export class UpdateCurriculumProfileHandler
  implements ICommandHandler<UpdateCurriculumProfileCommand, UpdateCurriculumProfileResult>
{
  constructor(private readonly profileRepository: ICurriculumProfileRepository) {}

  async execute(command: UpdateCurriculumProfileCommand): Promise<UpdateCurriculumProfileResult> {
    const { payload } = command;

    const profile = await this.profileRepository.findById(CurriculumProfileId.from(payload.id));
    if (!profile) {
      throw new CurriculumProfileNotFoundError(payload.id);
    }

    profile.update({
      name: payload.name,
      description: payload.description,
      authority: payload.authority,
      version: payload.version,
    });

    await this.profileRepository.save(profile);

    return {
      id: profile.id.unpack(),
    };
  }
}
