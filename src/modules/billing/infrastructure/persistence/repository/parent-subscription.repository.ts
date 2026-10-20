import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  ParentSubscription,
  ParentSubscriptionId,
  IParentSubscriptionRepository,
  SubscriptionStatus,
} from '../../../domain';
import { ParentSubscription as PrismaParentSubscription } from '@generated/prisma/client';
import { ParentSubscriptionMapper } from '../mappers/parent-subscription.mapper';

@Injectable()
export class PrismaParentSubscriptionRepository
  extends PrismaBaseRepository<ParentSubscriptionId, ParentSubscription, PrismaParentSubscription>
  implements IParentSubscriptionRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly subscriptionMapper: ParentSubscriptionMapper,
  ) {
    super(prisma, subscriptionMapper);
  }

  protected get delegate() {
    return this.prisma.parentSubscription;
  }

  public override async findById(id: ParentSubscriptionId | string): Promise<ParentSubscription | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.parentSubscription.findUnique({
      where: { id: rawId },
    });
    return record ? this.subscriptionMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<ParentSubscription[]> {
    const records = await this.prisma.parentSubscription.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.subscriptionMapper.toDomain(record));
  }

  public async findByParentId(parentId: string): Promise<ParentSubscription[]> {
    const records = await this.prisma.parentSubscription.findMany({
      where: { parentId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.subscriptionMapper.toDomain(r));
  }

  public async findByStudentId(studentId: string): Promise<ParentSubscription[]> {
    const records = await this.prisma.parentSubscription.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.subscriptionMapper.toDomain(r));
  }

  public async findByOrgId(orgId: string): Promise<ParentSubscription[]> {
    const records = await this.prisma.parentSubscription.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.subscriptionMapper.toDomain(r));
  }

  public async findByProviderSubscriptionId(
    providerSubscriptionId: string,
  ): Promise<ParentSubscription | null> {
    const record = await this.prisma.parentSubscription.findFirst({
      where: { providerSubscriptionId },
    });
    return record ? this.subscriptionMapper.toDomain(record) : null;
  }

  public async findActiveSubscription(
    parentId: string,
    studentId: string,
    subjectId: string,
    orgId: string,
  ): Promise<ParentSubscription | null> {
    const record = await this.prisma.parentSubscription.findFirst({
      where: {
        parentId,
        studentId,
        subjectId,
        orgId,
        status: SubscriptionStatus.active,
      },
    });
    return record ? this.subscriptionMapper.toDomain(record) : null;
  }

  public async findPastDueSubscriptions(): Promise<ParentSubscription[]> {
    const records = await this.prisma.parentSubscription.findMany({
      where: { status: SubscriptionStatus.past_due },
    });
    return records.map((r) => this.subscriptionMapper.toDomain(r));
  }

  public override async save(entity: ParentSubscription): Promise<void> {
    const data = this.subscriptionMapper.toPersistence(entity);
    const subscriptionId = entity.id.unpack();
    const events = entity.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.parentSubscription.upsert({
        where: { id: subscriptionId },
        create: {
          id: subscriptionId,
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

  public override async delete(id: ParentSubscriptionId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.parentSubscription.delete({
      where: { id: rawId },
    });
  }
}
