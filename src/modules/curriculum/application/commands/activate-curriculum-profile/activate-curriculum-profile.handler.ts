import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ActivateCurriculumProfileCommand } from './activate-curriculum-profile.command';
import { ActivateCurriculumProfileResult } from './activate-curriculum-profile.result';
import {
  CurriculumProfileId,
  CurriculumProfileNotFoundError,
  ICurriculumProfileRepository,
} from '../../../domain';

@CommandHandler(ActivateCurriculumProfileCommand)
export class ActivateCurriculumProfileHandler
  implements ICommandHandler<ActivateCurriculumProfileCommand, ActivateCurriculumProfileResult>
{
  constructor(private readonly profileRepository: ICurriculumProfileRepository) {}

  async execute(command: ActivateCurriculumProfileCommand): Promise<ActivateCurriculumProfileResult> {
    const { payload } = command;

    const profile = await this.profileRepository.findById(CurriculumProfileId.from(payload.id));
    if (!profile) {
      throw new CurriculumProfileNotFoundError(payload.id);
    }

    profile.activate();
    await this.profileRepository.save(profile);

    return {
      id: profile.id.unpack(),
      isActive: profile.isActive,
    };
  }
}
