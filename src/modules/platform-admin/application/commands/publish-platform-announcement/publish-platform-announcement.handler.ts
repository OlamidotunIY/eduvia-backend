import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PublishPlatformAnnouncementCommand } from './publish-platform-announcement.command';
import {
  IPlatformAdminRepository,
  IPlatformAnnouncementRepository,
  PlatformAnnouncementId,
  PlatformAnnouncementNotFoundError,
  UnauthorizedPlatformActionError,
} from '../../../domain';

export interface PublishPlatformAnnouncementResult {
  id: string;
  status: string;
  publishedAt: Date;
}

@CommandHandler(PublishPlatformAnnouncementCommand)
export class PublishPlatformAnnouncementHandler
  implements
    ICommandHandler<
      PublishPlatformAnnouncementCommand,
      PublishPlatformAnnouncementResult
    >
{
  constructor(
    private readonly adminRepository: IPlatformAdminRepository,
    private readonly announcementRepository: IPlatformAnnouncementRepository,
  ) {}

  async execute(
    command: PublishPlatformAnnouncementCommand,
  ): Promise<PublishPlatformAnnouncementResult> {
    const admin = await this.adminRepository.findByUserId(command.adminUserId);
    if (!admin || !admin.isSuperAdmin()) {
      throw new UnauthorizedPlatformActionError(
        'Only platform super admins can publish platform announcements.',
      );
    }

    const announcement = await this.announcementRepository.findById(
      PlatformAnnouncementId.from(command.announcementId),
    );
    if (!announcement) {
      throw new PlatformAnnouncementNotFoundError(command.announcementId);
    }

    announcement.publish();
    await this.announcementRepository.save(announcement);

    return {
      id: announcement.id.toString(),
      status: announcement.status,
      publishedAt: announcement.publishedAt as Date,
    };
  }
}
