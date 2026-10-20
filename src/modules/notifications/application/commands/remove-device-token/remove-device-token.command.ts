import { ICommand } from '@nestjs/cqrs';

export class RemoveDeviceTokenCommand implements ICommand {
  constructor(public readonly token: string) {}
}
