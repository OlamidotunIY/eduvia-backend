import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  OrgBillingAccount,
  OrgBillingAccountId,
  BillingModel,
  PaymentProvider,
  OrgPlanTier,
  BillingAccountStatus,
} from '../../../domain';
import { OrgBillingAccount as PrismaOrgBillingAccount } from '@generated/prisma/client';

@Injectable()
export class OrgBillingAccountMapper implements IMapper<OrgBillingAccount, PrismaOrgBillingAccount> {
  toDomain(record: PrismaOrgBillingAccount): OrgBillingAccount {
    return OrgBillingAccount.reconstitute({
      id: OrgBillingAccountId.from(record.id),
      orgId: record.orgId,
      billingModel: record.billingModel as BillingModel,
      stripeAccountId: record.stripeAccountId,
      paypalMerchantId: record.paypalMerchantId,
      paymentProvider: record.paymentProvider as PaymentProvider | null,
      stripeCustomerId: record.stripeCustomerId,
      seatCount: record.seatCount,
      freeTierActive: record.freeTierActive,
      planTier: record.planTier as OrgPlanTier,
      currentPeriodEnd: record.currentPeriodEnd,
      status: record.status as BillingAccountStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: OrgBillingAccount): PrismaOrgBillingAccount {
    return {
      id: entity.id.toString(),
      orgId: entity.orgId,
      billingModel: entity.billingModel,
      stripeAccountId: entity.stripeAccountId,
      paypalMerchantId: entity.paypalMerchantId,
      paymentProvider: entity.paymentProvider,
      stripeCustomerId: entity.stripeCustomerId,
      seatCount: entity.seatCount,
      freeTierActive: entity.freeTierActive,
      planTier: entity.planTier,
      currentPeriodEnd: entity.currentPeriodEnd,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
