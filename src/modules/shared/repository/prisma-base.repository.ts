import { OutboxStatus } from '@generated/prisma/enums';
import { AggregateRoot, DomainEvent } from '../domain';
import { PrismaService } from '../infrastructure';
import { BaseRepository } from './base.repository';
import { PrismaPromise } from '@generated/prisma/internal/prismaNamespace';
import { BaseEntityId, OutboxMessageId } from '../domain/value-object';

export interface IMapper<TDomain, TRecord> {
  toDomain(record: TRecord): TDomain;
  toPersistence(entity: TDomain): Omit<TRecord, 'id'>;
}

type PrismaDelegate<TRecord> = {
  findUnique(args: { where: { id: string } }): Promise<TRecord | null>;
  findMany(args?: object): Promise<TRecord[]>;
  upsert(args: {
    where: { id: string };
    create: TRecord;
    update: Omit<TRecord, 'id'>;
  }): PrismaPromise<TRecord>;
  delete(args: { where: { id: string } }): Promise<TRecord>;
};

export abstract class PrismaBaseRepository<
  TId extends BaseEntityId,
  TDomain extends AggregateRoot<TId>,
  TRecord extends { id: string },
> extends BaseRepository<TDomain, TId> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mapper: IMapper<TDomain, TRecord>,
  ) {
    super();
  }

  protected abstract get delegate(): PrismaDelegate<TRecord>;

  async findById(id: TId | string): Promise<TDomain | null> {
    const record = await this.delegate.findUnique({ where: { id: String(id) } });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findAll(): Promise<TDomain[]> {
    const records = await this.delegate.findMany();
    return records.map((r) => this.mapper.toDomain(r));
  }

  async save(entity: TDomain): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    const events: DomainEvent[] = entity.pullDomainEvents();

    const outboxWrites = events.map((event) =>
      this.prisma.outboxMessage.create({
        data: {
          id: OutboxMessageId.create().value,
          eventId: event.eventId,
          type: event.eventName,
          aggregateType: entity.constructor.name,
          aggregateId: entity.getId(),
          payload: event.payload as object,
          correlationId: event.correlationId,
          occurredAt: event.occurredAt,
          status: OutboxStatus.PENDING,
        },
      }),
    );

    await this.prisma.$transaction([
      this.delegate.upsert({
        where: { id: entity.getId() },
        create: { id: entity.getId(), ...data } as TRecord,
        update: data as Omit<TRecord, 'id'>,
      }),
      ...outboxWrites,
    ]);
  }

  async delete(id: TId | string): Promise<void> {
    await this.delegate.delete({ where: { id: String(id) } });
  }
}
