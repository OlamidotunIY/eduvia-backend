import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ArchivePlatformAnnouncementCommand } from './archive-platform-announcement.command';
import {
  IPlatformAdminRepository,
  IPlatformAnnouncementRepository,
  PlatformAnnouncementId,
  PlatformAnnouncementNotFoundError,
  UnauthorizedPlatformActionError,
} from '../../../domain';

export interface ArchivePlatformAnnouncementResult {
  id: string;
  status: string;
  archivedAt: Date;
}

@CommandHandler(ArchivePlatformAnnouncementCommand)
export class ArchivePlatformAnnouncementHandler
  implements
    ICommandHandler<
      ArchivePlatformAnnouncementCommand,
      ArchivePlatformAnnouncementResult
    >
{
  constructor(
    private readonly adminRepository: IPlatformAdminRepository,
    private readonly announcementRepository: IPlatformAnnouncementRepository,
  ) {}

  async execute(
    command: ArchivePlatformAnnouncementCommand,
  ): Promise<ArchivePlatformAnnouncementResult> {
    const admin = await this.adminRepository.findByUserId(command.adminUserId);
    if (!admin || !admin.isSuperAdmin()) {
      throw new UnauthorizedPlatformActionError(
        'Only platform super admins can archive platform announcements.',
      );
    }

    const announcement = await this.announcementRepository.findById(
      PlatformAnnouncementId.from(command.announcementId),
    );
    if (!announcement) {
      throw new PlatformAnnouncementNotFoundError(command.announcementId);
    }

    announcement.archive();
    await this.announcementRepository.save(announcement);

    return {
      id: announcement.id.toString(),
      status: announcement.status,
      archivedAt: announcement.archivedAt as Date,
    };
  }
}
