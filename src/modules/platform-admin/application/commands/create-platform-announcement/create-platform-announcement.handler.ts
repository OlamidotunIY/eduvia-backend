import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePlatformAnnouncementCommand } from './create-platform-announcement.command';
import {
  IPlatformAdminRepository,
  IPlatformAnnouncementRepository,
  PlatformAnnouncement,
  UnauthorizedPlatformActionError,
} from '../../../domain';

export interface CreatePlatformAnnouncementResult {
  id: string;
  status: string;
}

@CommandHandler(CreatePlatformAnnouncementCommand)
export class CreatePlatformAnnouncementHandler
  implements
    ICommandHandler<
      CreatePlatformAnnouncementCommand,
      CreatePlatformAnnouncementResult
    >
{
  constructor(
    private readonly adminRepository: IPlatformAdminRepository,
    private readonly announcementRepository: IPlatformAnnouncementRepository,
  ) {}

  async execute(
    command: CreatePlatformAnnouncementCommand,
  ): Promise<CreatePlatformAnnouncementResult> {
    const admin = await this.adminRepository.findByUserId(command.creatorUserId);
    if (!admin) {
      throw new UnauthorizedPlatformActionError(
        'Caller must be a platform administrator to create announcements.',
      );
    }

    const announcement = PlatformAnnouncement.create({
      title: command.title,
      body: command.body,
      targetRoles: command.targetRoles,
      createdBy: command.creatorUserId,
    });

    if (command.scheduledAt) {
      announcement.schedule(command.scheduledAt);
    }

    await this.announcementRepository.save(announcement);

    return {
      id: announcement.id.toString(),
      status: announcement.status,
    };
  }
}
