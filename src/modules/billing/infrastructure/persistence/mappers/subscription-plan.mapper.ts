import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  SubscriptionPlan,
  SubscriptionPlanId,
  BillingInterval,
} from '../../../domain';
import {
  SubscriptionPlan as PrismaSubscriptionPlan,
  PlanDiscount as PrismaPlanDiscount,
} from '@generated/prisma/client';
import { PlanDiscountMapper } from './plan-discount.mapper';

export type SubscriptionPlanWithRelations = PrismaSubscriptionPlan & {
  discounts?: PrismaPlanDiscount[];
};

@Injectable()
export class SubscriptionPlanMapper
  implements IMapper<SubscriptionPlan, SubscriptionPlanWithRelations>
{
  constructor(private readonly discountMapper: PlanDiscountMapper) {}

  toDomain(record: SubscriptionPlanWithRelations): SubscriptionPlan {
    const discounts = (record.discounts ?? []).map((d) => this.discountMapper.toDomain(d));

    return SubscriptionPlan.reconstitute({
      id: SubscriptionPlanId.from(record.id),
      orgId: record.orgId,
      subjectId: record.subjectId,
      name: record.name,
      description: record.description,
      priceAmount: record.priceAmount,
      currency: record.currency,
      billingInterval: record.billingInterval as BillingInterval,
      lessonsPerInterval: record.lessonsPerInterval,
      isActive: record.isActive,
      stripePriceId: record.stripePriceId,
      paypalPlanId: record.paypalPlanId,
      discounts,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: SubscriptionPlan): SubscriptionPlanWithRelations {
    return {
      id: entity.id.toString(),
      orgId: entity.orgId,
      subjectId: entity.subjectId,
      name: entity.name,
      description: entity.description,
      priceAmount: entity.priceAmount,
      currency: entity.currency,
      billingInterval: entity.billingInterval,
      lessonsPerInterval: entity.lessonsPerInterval,
      isActive: entity.isActive,
      stripePriceId: entity.stripePriceId,
      paypalPlanId: entity.paypalPlanId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      discounts: entity.discounts.map((d) => this.discountMapper.toPersistence(d)),
    };
  }
}
