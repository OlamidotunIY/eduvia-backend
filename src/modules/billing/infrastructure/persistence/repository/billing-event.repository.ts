import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  BillingEvent,
  BillingEventId,
  IBillingEventRepository,
} from '../../../domain';
import { BillingEvent as PrismaBillingEvent } from '@generated/prisma/client';
import { BillingEventMapper } from '../mappers/billing-event.mapper';

@Injectable()
export class PrismaBillingEventRepository
  extends PrismaBaseRepository<BillingEventId, BillingEvent, PrismaBillingEvent>
  implements IBillingEventRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly eventMapper: BillingEventMapper,
  ) {
    super(prisma, eventMapper);
  }

  protected get delegate() {
    return this.prisma.billingEvent;
  }

  public override async findById(id: BillingEventId | string): Promise<BillingEvent | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.billingEvent.findUnique({
      where: { id: rawId },
    });
    return record ? this.eventMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<BillingEvent[]> {
    const records = await this.prisma.billingEvent.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.eventMapper.toDomain(record));
  }

  public async findByProviderEventId(providerEventId: string): Promise<BillingEvent | null> {
    const record = await this.prisma.billingEvent.findUnique({
      where: { providerEventId },
    });
    return record ? this.eventMapper.toDomain(record) : null;
  }

  public async findByOrgId(orgId: string, limit?: number): Promise<BillingEvent[]> {
    const records = await this.prisma.billingEvent.findMany({
      where: { orgId },
      orderBy: { occurredAt: 'desc' },
      take: limit ?? 50,
    });
    return records.map((r) => this.eventMapper.toDomain(r));
  }

  public async findBySubscriptionId(subscriptionId: string): Promise<BillingEvent[]> {
    const records = await this.prisma.billingEvent.findMany({
      where: { subscriptionId },
      orderBy: { occurredAt: 'desc' },
    });
    return records.map((r) => this.eventMapper.toDomain(r));
  }

  public override async save(entity: BillingEvent): Promise<void> {
    const data = this.eventMapper.toPersistence(entity);
    const eventId = entity.id.unpack();
    const events = entity.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.billingEvent.upsert({
        where: { id: eventId },
        create: {
          id: eventId,
          ...data,
        },
        update: data,
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

  public override async delete(id: BillingEventId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.billingEvent.delete({
      where: { id: rawId },
    });
  }
}
