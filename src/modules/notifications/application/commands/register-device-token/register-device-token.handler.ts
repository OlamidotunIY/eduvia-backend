import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterDeviceTokenCommand } from './register-device-token.command';
import { IDeviceTokenRepository, DeviceToken } from '../../../domain';

@CommandHandler(RegisterDeviceTokenCommand)
export class RegisterDeviceTokenHandler implements ICommandHandler<RegisterDeviceTokenCommand, void> {
  constructor(private readonly deviceTokenRepository: IDeviceTokenRepository) {}

  async execute(command: RegisterDeviceTokenCommand): Promise<void> {
    const existing = await this.deviceTokenRepository.findByToken(command.token);

    if (existing) {
      existing.activate(command.token);
      await this.deviceTokenRepository.save(existing);
      return;
    }

    const deviceToken = DeviceToken.create({
      userId: command.userId,
      token: command.token,
      platform: command.platform,
    });

    await this.deviceTokenRepository.save(deviceToken);
  }
}
