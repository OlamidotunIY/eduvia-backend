import { ICommand } from '@nestjs/cqrs';
import { DevicePlatform } from '../../../domain';

export class RegisterDeviceTokenCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly token: string,
    public readonly platform: DevicePlatform,
  ) {}
}
