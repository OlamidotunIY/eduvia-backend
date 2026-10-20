import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  ParentSubscription,
  ParentSubscriptionId,
  SubscriptionPlanId,
  PaymentProvider,
  SubscriptionStatus,
  PlanDiscountId,
} from '../../../domain';
import { ParentSubscription as PrismaParentSubscription } from '@generated/prisma/client';

@Injectable()
export class ParentSubscriptionMapper
  implements IMapper<ParentSubscription, PrismaParentSubscription>
{
  toDomain(record: PrismaParentSubscription): ParentSubscription {
    return ParentSubscription.reconstitute({
      id: ParentSubscriptionId.from(record.id),
      orgId: record.orgId,
      planId: SubscriptionPlanId.from(record.planId),
      parentId: record.parentId,
      studentId: record.studentId,
      subjectId: record.subjectId,
      provider: record.provider as PaymentProvider,
      providerSubscriptionId: record.providerSubscriptionId,
      status: record.status as SubscriptionStatus,
      discountId: record.discountId ? PlanDiscountId.from(record.discountId) : null,
      effectivePriceAmount: record.effectivePriceAmount,
      currentPeriodStart: record.currentPeriodStart,
      currentPeriodEnd: record.currentPeriodEnd,
      cancelledAt: record.cancelledAt,
      cancelReason: record.cancelReason,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: ParentSubscription): PrismaParentSubscription {
    return {
      id: entity.id.toString(),
      orgId: entity.orgId,
      planId: entity.planId.toString(),
      parentId: entity.parentId,
      studentId: entity.studentId,
      subjectId: entity.subjectId,
      provider: entity.provider,
      providerSubscriptionId: entity.providerSubscriptionId,
      status: entity.status,
      discountId: entity.discountId ? entity.discountId.toString() : null,
      effectivePriceAmount: entity.effectivePriceAmount,
      currentPeriodStart: entity.currentPeriodStart,
      currentPeriodEnd: entity.currentPeriodEnd,
      cancelledAt: entity.cancelledAt,
      cancelReason: entity.cancelReason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
