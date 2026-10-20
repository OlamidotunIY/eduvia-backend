import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  PlatformAnnouncement,
  PlatformAnnouncementId,
  AnnouncementStatus,
} from '../../../domain';
import { PlatformAnnouncement as PrismaPlatformAnnouncement } from '@generated/prisma/client';

@Injectable()
export class PlatformAnnouncementMapper
  implements IMapper<PlatformAnnouncement, PrismaPlatformAnnouncement>
{
  toDomain(record: PrismaPlatformAnnouncement): PlatformAnnouncement {
    const targetRoles = Array.isArray(record.targetRoles)
      ? (record.targetRoles as string[])
      : [];

    return PlatformAnnouncement.reconstitute({
      id: PlatformAnnouncementId.from(record.id),
      title: record.title,
      body: record.body,
      targetRoles,
      status: record.status as AnnouncementStatus,
      scheduledAt: record.scheduledAt,
      publishedAt: record.publishedAt,
      archivedAt: record.archivedAt,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: PlatformAnnouncement): PrismaPlatformAnnouncement {
    return {
      id: entity.id.toString(),
      title: entity.title,
      body: entity.body,
      targetRoles: entity.targetRoles,
      status: entity.status,
      scheduledAt: entity.scheduledAt,
      publishedAt: entity.publishedAt,
      archivedAt: entity.archivedAt,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
