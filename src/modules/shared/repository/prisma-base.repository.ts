import { OutboxStatus } from '@generated/prisma/enums';
import { AggregateRoot, DomainEvent } from '../domain';
import { PrismaService } from '../infrastructure';
import { BaseRepository } from './base.repository';
import { PrismaPromise } from '@generated/prisma/internal/prismaNamespace';

export interface IMapper<TDomain, TRecord> {
  toDomain(record: TRecord): TDomain;
  toPersistence(entity: TDomain): Omit<TRecord, 'id'>;
}

type PrismaDelegate<TRecord> = {
  findUnique(args: { where: { id: number } }): Promise<TRecord | null>;
  findMany(args?: object): Promise<TRecord[]>;
  upsert(args: {
    where: { id: number };
    create: TRecord;
    update: Omit<TRecord, 'id'>;
  }): PrismaPromise<TRecord>;
  delete(args: { where: { id: number } }): Promise<TRecord>;
};

export abstract class PrismaBaseRepository<
  TDomain extends AggregateRoot<number>,
  TRecord extends { id: number },
> extends BaseRepository<TDomain, number> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mapper: IMapper<TDomain, TRecord>,
  ) {
    super();
  }

  protected abstract get delegate(): PrismaDelegate<TRecord>;

  async findById(id: number): Promise<TDomain | null> {
    const record = await this.delegate.findUnique({ where: { id } });
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
          type: event.eventName,
          aggregateType: entity.constructor.name,
          aggregateId: entity.id,
          payload: event.payload as object,
          status: OutboxStatus.PENDING,
        },
      }),
    );

    await this.prisma.$transaction([
      this.delegate.upsert({
        where: { id: entity.id },
        create: { id: entity.id, ...data } as TRecord,
        update: data as Omit<TRecord, 'id'>,
      }),
      ...outboxWrites,
    ]);
  }

  async delete(id: number): Promise<void> {
    await this.delegate.delete({ where: { id } });
  }
}
