import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SchedulePlatformAnnouncementCommand } from './schedule-platform-announcement.command';
import {
  IPlatformAdminRepository,
  IPlatformAnnouncementRepository,
  PlatformAnnouncementId,
  PlatformAnnouncementNotFoundError,
  UnauthorizedPlatformActionError,
} from '../../../domain';

export interface SchedulePlatformAnnouncementResult {
  id: string;
  status: string;
  scheduledAt: Date;
}

@CommandHandler(SchedulePlatformAnnouncementCommand)
export class SchedulePlatformAnnouncementHandler
  implements
    ICommandHandler<
      SchedulePlatformAnnouncementCommand,
      SchedulePlatformAnnouncementResult
    >
{
  constructor(
    private readonly adminRepository: IPlatformAdminRepository,
    private readonly announcementRepository: IPlatformAnnouncementRepository,
  ) {}

  async execute(
    command: SchedulePlatformAnnouncementCommand,
  ): Promise<SchedulePlatformAnnouncementResult> {
    const admin = await this.adminRepository.findByUserId(command.adminUserId);
    if (!admin || !admin.isSuperAdmin()) {
      throw new UnauthorizedPlatformActionError(
        'Only platform super admins can schedule platform announcements.',
      );
    }

    const announcement = await this.announcementRepository.findById(
      PlatformAnnouncementId.from(command.announcementId),
    );
    if (!announcement) {
      throw new PlatformAnnouncementNotFoundError(command.announcementId);
    }

    announcement.schedule(command.scheduledAt);
    await this.announcementRepository.save(announcement);

    return {
      id: announcement.id.toString(),
      status: announcement.status,
      scheduledAt: announcement.scheduledAt as Date,
    };
  }
}
