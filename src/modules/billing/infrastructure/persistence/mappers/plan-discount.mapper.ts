import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  PlanDiscount,
  PlanDiscountId,
  SubscriptionPlanId,
  DiscountType,
  DiscountScope,
} from '../../../domain';
import { PlanDiscount as PrismaPlanDiscount } from '@generated/prisma/client';

@Injectable()
export class PlanDiscountMapper implements IMapper<PlanDiscount, PrismaPlanDiscount> {
  toDomain(record: PrismaPlanDiscount): PlanDiscount {
    return PlanDiscount.reconstitute({
      id: PlanDiscountId.from(record.id),
      planId: SubscriptionPlanId.from(record.planId),
      type: record.type as DiscountType,
      amount: record.amount,
      currency: record.currency,
      scope: record.scope as DiscountScope,
      parentId: record.parentId,
      expiresAt: record.expiresAt,
      isActive: record.isActive,
      code: record.code,
      createdAt: record.createdAt,
    });
  }

  toPersistence(entity: PlanDiscount): PrismaPlanDiscount {
    return {
      id: entity.id.toString(),
      planId: entity.planId.toString(),
      type: entity.type,
      amount: entity.amount,
      currency: entity.currency,
      scope: entity.scope,
      parentId: entity.parentId,
      expiresAt: entity.expiresAt,
      isActive: entity.isActive,
      code: entity.code,
      createdAt: entity.createdAt,
    };
  }
}
