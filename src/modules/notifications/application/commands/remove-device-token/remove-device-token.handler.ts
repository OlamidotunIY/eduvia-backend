import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveDeviceTokenCommand } from './remove-device-token.command';
import { IDeviceTokenRepository } from '../../../domain';

@CommandHandler(RemoveDeviceTokenCommand)
export class RemoveDeviceTokenHandler implements ICommandHandler<RemoveDeviceTokenCommand, void> {
  constructor(private readonly deviceTokenRepository: IDeviceTokenRepository) {}

  async execute(command: RemoveDeviceTokenCommand): Promise<void> {
    await this.deviceTokenRepository.deactivateToken(command.token);
  }
}
