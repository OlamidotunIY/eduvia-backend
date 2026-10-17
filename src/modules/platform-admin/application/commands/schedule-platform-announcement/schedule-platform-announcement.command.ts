import { ICommand } from '@nestjs/cqrs';

export class SchedulePlatformAnnouncementCommand implements ICommand {
  constructor(
    public readonly adminUserId: string,
    public readonly announcementId: string,
    public readonly scheduledAt: Date,
  ) {}
}
