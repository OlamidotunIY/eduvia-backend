import { ICommand } from '@nestjs/cqrs';

export class CreatePlatformAnnouncementCommand implements ICommand {
  constructor(
    public readonly creatorUserId: string,
    public readonly title: string,
    public readonly body: string,
    public readonly targetRoles?: string[],
    public readonly scheduledAt?: Date,
  ) {}
}
