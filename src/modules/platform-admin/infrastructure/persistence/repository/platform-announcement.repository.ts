import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  PlatformAnnouncement,
  PlatformAnnouncementId,
  AnnouncementStatus,
  IPlatformAnnouncementRepository,
} from '../../../domain';
import {
  PlatformAnnouncement as PrismaPlatformAnnouncement,
  Prisma,
} from '@generated/prisma/client';
import { PlatformAnnouncementMapper } from '../mappers/platform-announcement.mapper';

@Injectable()
export class PrismaPlatformAnnouncementRepository
  extends PrismaBaseRepository<
    PlatformAnnouncementId,
    PlatformAnnouncement,
    PrismaPlatformAnnouncement
  >
  implements IPlatformAnnouncementRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly announcementMapper: PlatformAnnouncementMapper,
  ) {
    super(prisma, announcementMapper);
  }

  protected get delegate() {
    return this.prisma.platformAnnouncement;
  }

  public override async findById(
    id: PlatformAnnouncementId | string,
  ): Promise<PlatformAnnouncement | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.platformAnnouncement.findUnique({
      where: { id: rawId },
    });
    return record ? this.announcementMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<PlatformAnnouncement[]> {
    const records = await this.prisma.platformAnnouncement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.announcementMapper.toDomain(record));
  }

  public async findByStatus(
    status: AnnouncementStatus,
  ): Promise<PlatformAnnouncement[]> {
    const records = await this.prisma.platformAnnouncement.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.announcementMapper.toDomain(record));
  }

  public async findDueScheduled(now: Date): Promise<PlatformAnnouncement[]> {
    const records = await this.prisma.platformAnnouncement.findMany({
      where: {
        status: AnnouncementStatus.scheduled,
        scheduledAt: {
          lte: now,
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
    return records.map((record) => this.announcementMapper.toDomain(record));
  }

  public override async save(entity: PlatformAnnouncement): Promise<void> {
    const data = this.announcementMapper.toPersistence(entity);
    const announcementId = entity.id.unpack();
    const events = entity.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.platformAnnouncement.upsert({
        where: { id: announcementId },
        create: {
          id: announcementId,
          title: data.title,
          body: data.body,
          targetRoles: data.targetRoles as Prisma.InputJsonValue,
          status: data.status,
          scheduledAt: data.scheduledAt,
          publishedAt: data.publishedAt,
          archivedAt: data.archivedAt,
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
        update: {
          title: data.title,
          body: data.body,
          targetRoles: data.targetRoles as Prisma.InputJsonValue,
          status: data.status,
          scheduledAt: data.scheduledAt,
          publishedAt: data.publishedAt,
          archivedAt: data.archivedAt,
          createdBy: data.createdBy,
          updatedAt: data.updatedAt,
        },
      });

      for (const event of events) {
        await tx.outboxMessage.create({
          data: {
            id: typeof event.eventId === 'string' ? event.eventId : String(event.eventId),
            eventId: event.eventId,
            type: event.eventName,
            aggregateType: entity.constructor.name,
            aggregateId: entity.getId(),
            payload: event.payload as object,
            correlationId: event.correlationId,
            occurredAt: event.occurredAt,
            status: 'PENDING' as any,
          },
        });
      }
    });
  }

  public override async delete(id: PlatformAnnouncementId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.platformAnnouncement.delete({
      where: { id: rawId },
    });
  }
}
