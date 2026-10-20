import { ICommand } from '@nestjs/cqrs';
import { PlatformAdminRole } from '../../../domain';

export class CreatePlatformAdminCommand implements ICommand {
  constructor(
    public readonly callerUserId: string,
    public readonly userId: string,
    public readonly role: PlatformAdminRole,
  ) {}
}
