import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SetActiveOrganizationCommand } from './set-active-organization.command';
import { SetActiveOrganizationResult } from './set-active-organization.result';
import { IUserRepository } from '../../../domain/repository';
import { UserId } from '../../../domain';

@CommandHandler(SetActiveOrganizationCommand)
export class SetActiveOrganizationHandler implements ICommandHandler<SetActiveOrganizationCommand, SetActiveOrganizationResult> {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: SetActiveOrganizationCommand): Promise<SetActiveOrganizationResult> {
    const { payload } = command;

    const user = await this.userRepository.findById(UserId.from(payload.userId));
    if (!user) throw new Error('User not found');
    if (payload.onlyIfUnset && user.activeOrganizationId) {
      return { id: user.getId(), changed: false };
    }
    user.setActiveOrganization(payload.organizationId);
    await this.userRepository.save(user);

    return {
      id: user.getId(),
      changed: true,
    };
  }
}
