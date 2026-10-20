import { ICommand } from '@nestjs/cqrs';

export class ArchivePlatformAnnouncementCommand implements ICommand {
  constructor(
    public readonly adminUserId: string,
    public readonly announcementId: string,
  ) {}
}
