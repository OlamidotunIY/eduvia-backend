import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlatformAnnouncementByIdQuery } from './get-platform-announcement-by-id.query';
import {
  IPlatformAnnouncementRepository,
  PlatformAnnouncementId,
} from '../../../domain';
import { PlatformAnnouncementDto } from '../dto/platform-announcement.dto';

@QueryHandler(GetPlatformAnnouncementByIdQuery)
export class GetPlatformAnnouncementByIdHandler
  implements
    IQueryHandler<GetPlatformAnnouncementByIdQuery, PlatformAnnouncementDto | null>
{
  constructor(
    private readonly announcementRepository: IPlatformAnnouncementRepository,
  ) {}

  async execute(
    query: GetPlatformAnnouncementByIdQuery,
  ): Promise<PlatformAnnouncementDto | null> {
    const a = await this.announcementRepository.findById(
      PlatformAnnouncementId.from(query.id),
    );
    if (!a) {
      return null;
    }
    return {
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
    };
  }
}
