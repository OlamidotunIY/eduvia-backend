import { ICommand } from '@nestjs/cqrs';

export class PublishPlatformAnnouncementCommand implements ICommand {
  constructor(
    public readonly adminUserId: string,
    public readonly announcementId: string,
  ) {}
}
