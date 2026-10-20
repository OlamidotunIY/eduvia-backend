import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IUserRepository } from '../../../domain';
import { MarkEmailVerifiedCommand } from './mark-email-verified.command';

@CommandHandler(MarkEmailVerifiedCommand)
export class MarkEmailVerifiedHandler
  implements ICommandHandler<MarkEmailVerifiedCommand>
{
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: MarkEmailVerifiedCommand): Promise<void> {
    await this.userRepository.markEmailVerified(command.payload.userId);
  }
}
