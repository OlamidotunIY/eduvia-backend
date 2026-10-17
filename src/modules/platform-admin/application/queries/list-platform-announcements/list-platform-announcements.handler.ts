import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPlatformAnnouncementsQuery } from './list-platform-announcements.query';
import { IPlatformAnnouncementRepository } from '../../../domain';
import { PlatformAnnouncementDto } from '../dto/platform-announcement.dto';

@QueryHandler(ListPlatformAnnouncementsQuery)
export class ListPlatformAnnouncementsHandler
  implements
    IQueryHandler<ListPlatformAnnouncementsQuery, PlatformAnnouncementDto[]>
{
  constructor(
    private readonly announcementRepository: IPlatformAnnouncementRepository,
  ) {}

  async execute(
    query: ListPlatformAnnouncementsQuery,
  ): Promise<PlatformAnnouncementDto[]> {
    const announcements = query.status
      ? await this.announcementRepository.findByStatus(query.status)
      : await this.announcementRepository.findAll();

    return announcements.map((a) => ({
      id: a.id.toString(),
      title: a.title,
      body: a.body,
      targetRoles: a.targetRoles,
      status: a.status,
      scheduledAt: a.scheduledAt,
      publishedAt: a.publishedAt,
      archivedAt: a.archivedAt,
      createdBy: a.createdBy,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));
  }
}
