import {
  BillingModel,
  PaymentProvider,
  OrgPlanTier,
  BillingInterval,
  DiscountType,
  DiscountScope,
} from '../../domain';

export class SetupOrgBillingDto {
  billingModel!: BillingModel;
  planTier?: OrgPlanTier;
}

export class ConnectStripeDto {
  stripeAccountId?: string;
  returnUrl?: string;
  refreshUrl?: string;
}

export class ConnectPayPalDto {
  merchantId!: string;
}

export class UpgradeOrgTierDto {
  tier!: OrgPlanTier;
}

export class CreateSubscriptionPlanDto {
  subjectId!: string;
  name!: string;
  description?: string;
  priceAmount!: number;
  currency!: string;
  billingInterval!: BillingInterval;
  lessonsPerInterval!: number;
}

export class AddPlanDiscountDto {
  type!: DiscountType;
  amount!: number;
  currency?: string;
  scope!: DiscountScope;
  parentId?: string;
  expiresAt?: Date;
  code?: string;
}

export class SubscribeParentDto {
  orgId!: string;
  planId!: string;
  studentId!: string;
  provider!: PaymentProvider;
  providerSubscriptionId!: string;
  discountCode?: string;
  durationDays?: number;
}

export class CancelSubscriptionDto {
  reason?: string;
}
