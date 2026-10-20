import { PrismaBaseRepository, PrismaService, OutboxMessageId } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  ITeacherAvailabilityRepository,
  TeacherAvailability,
  TeacherAvailabilityId,
} from '../../../domain';
import {
  TeacherAvailabilityMapper,
  PrismaTeacherAvailabilityWithRelations,
} from '../mappers/teacher-availability.mapper';

@Injectable()
export class PrismaTeacherAvailabilityRepository
  extends PrismaBaseRepository<
    TeacherAvailabilityId,
    TeacherAvailability,
    PrismaTeacherAvailabilityWithRelations
  >
  implements ITeacherAvailabilityRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly teacherAvailabilityMapper: TeacherAvailabilityMapper,
  ) {
    super(prisma, teacherAvailabilityMapper);
  }

  protected get delegate() {
    return this.prisma.teacherAvailability as any;
  }

  public override async findById(
    id: TeacherAvailabilityId | string,
  ): Promise<TeacherAvailability | null> {
    const record = await this.prisma.teacherAvailability.findUnique({
      where: { id: String(id) },
      include: { slots: true, exceptions: true },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<TeacherAvailability[]> {
    const records = await this.prisma.teacherAvailability.findMany({
      include: { slots: true, exceptions: true },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByTeacherId(
    orgId: string,
    teacherId: string,
  ): Promise<TeacherAvailability | null> {
    const record = await this.prisma.teacherAvailability.findFirst({
      where: { orgId, teacherId },
      include: { slots: true, exceptions: true },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public override async save(entity: TeacherAvailability): Promise<void> {
    const events = entity.pullDomainEvents();
    const data = this.mapper.toPersistence(entity);

    await this.prisma.$transaction(async (tx) => {
      await tx.teacherAvailability.upsert({
        where: { id: entity.id.value },
        create: { id: entity.id.value, ...data },
        update: data,
      });

      await tx.availabilitySlot.deleteMany({
        where: { availabilityId: entity.id.value },
      });
      if (entity.slots.length > 0) {
        await tx.availabilitySlot.createMany({
          data: entity.slots.map((s) => ({
            id: s.id.value,
            availabilityId: entity.id.value,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            timezone: s.timezone,
          })),
        });
      }

      await tx.availabilityException.deleteMany({
        where: { availabilityId: entity.id.value },
      });
      if (entity.exceptions.length > 0) {
        await tx.availabilityException.createMany({
          data: entity.exceptions.map((e) => ({
            id: e.id.value,
            availabilityId: entity.id.value,
            date: e.date,
            type: e.type,
            startTime: e.startTime,
            endTime: e.endTime,
            reason: e.reason,
          })),
        });
      }

      for (const event of events) {
        await tx.outboxMessage.create({
          data: {
            id: OutboxMessageId.create().value,
            eventId: event.eventId,
            type: event.eventName,
            aggregateType: entity.constructor.name,
            aggregateId: entity.id.value,
            payload: event.payload as any,
            occurredOn: event.occurredOn,
            correlationId: event.correlationId,
            causationId: event.causationId,
            status: 'PENDING' as any,
          },
        });
      }
    });
  }
}
