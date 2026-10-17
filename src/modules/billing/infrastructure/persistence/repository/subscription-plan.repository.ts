import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  SubscriptionPlan,
  SubscriptionPlanId,
  ISubscriptionPlanRepository,
} from '../../../domain';
import { SubscriptionPlanMapper, SubscriptionPlanWithRelations } from '../mappers/subscription-plan.mapper';
import { PlanDiscountMapper } from '../mappers/plan-discount.mapper';

@Injectable()
export class PrismaSubscriptionPlanRepository
  extends PrismaBaseRepository<SubscriptionPlanId, SubscriptionPlan, SubscriptionPlanWithRelations>
  implements ISubscriptionPlanRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly planMapper: SubscriptionPlanMapper,
    protected readonly discountMapper: PlanDiscountMapper,
  ) {
    super(prisma, planMapper);
  }

  protected get delegate() {
    return this.prisma.subscriptionPlan;
  }

  public override async findById(id: SubscriptionPlanId | string): Promise<SubscriptionPlan | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.subscriptionPlan.findUnique({
      where: { id: rawId },
      include: { discounts: true },
    });
    return record ? this.planMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<SubscriptionPlan[]> {
    const records = await this.prisma.subscriptionPlan.findMany({
      include: { discounts: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.planMapper.toDomain(record));
  }

  public async findByOrgId(orgId: string, activeOnly: boolean = false): Promise<SubscriptionPlan[]> {
    const where: any = { orgId };
    if (activeOnly) {
      where.isActive = true;
    }

    const records = await this.prisma.subscriptionPlan.findMany({
      where,
      include: { discounts: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.planMapper.toDomain(record));
  }

  public async findBySubjectId(orgId: string, subjectId: string): Promise<SubscriptionPlan[]> {
    const records = await this.prisma.subscriptionPlan.findMany({
      where: { orgId, subjectId, isActive: true },
      include: { discounts: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.planMapper.toDomain(record));
  }

  public override async save(entity: SubscriptionPlan): Promise<void> {
    const persistenceData = this.planMapper.toPersistence(entity);
    const planId = entity.id.unpack();
    const events = entity.pullDomainEvents();

    const { discounts, ...planData } = persistenceData;

    await this.prisma.$transaction(async (tx) => {
      await tx.subscriptionPlan.upsert({
        where: { id: planId },
        create: {
          id: planId,
          ...planData,
        },
        update: planData,
      });

      if (discounts && discounts.length > 0) {
        for (const discount of discounts) {
          await tx.planDiscount.upsert({
            where: { id: discount.id },
            create: discount,
            update: discount,
          });
        }
      }

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

  public override async delete(id: SubscriptionPlanId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.subscriptionPlan.delete({
      where: { id: rawId },
    });
  }
}
