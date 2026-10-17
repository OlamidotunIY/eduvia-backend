import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeactivateCurriculumProfileCommand } from './deactivate-curriculum-profile.command';
import { DeactivateCurriculumProfileResult } from './deactivate-curriculum-profile.result';
import {
  CurriculumProfileId,
  CurriculumProfileNotFoundError,
  ICurriculumProfileRepository,
} from '../../../domain';

@CommandHandler(DeactivateCurriculumProfileCommand)
export class DeactivateCurriculumProfileHandler
  implements ICommandHandler<DeactivateCurriculumProfileCommand, DeactivateCurriculumProfileResult>
{
  constructor(private readonly profileRepository: ICurriculumProfileRepository) {}

  async execute(command: DeactivateCurriculumProfileCommand): Promise<DeactivateCurriculumProfileResult> {
    const { payload } = command;

    const profile = await this.profileRepository.findById(CurriculumProfileId.from(payload.id));
    if (!profile) {
      throw new CurriculumProfileNotFoundError(payload.id);
    }

    profile.deactivate();
    await this.profileRepository.save(profile);

    return {
      id: profile.id.unpack(),
      isActive: profile.isActive,
    };
  }
}
