export class PlanDiscountDto {
  constructor(
    public readonly id: string,
    public readonly planId: string,
    public readonly type: string,
    public readonly amount: number,
    public readonly currency: string | null,
    public readonly scope: string,
    public readonly parentId: string | null,
    public readonly expiresAt: Date | null,
    public readonly isActive: boolean,
    public readonly code: string | null,
    public readonly createdAt: Date,
  ) {}
}

export class SubscriptionPlanDto {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly subjectId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly priceAmount: number,
    public readonly currency: string,
    public readonly billingInterval: string,
    public readonly lessonsPerInterval: number,
    public readonly isActive: boolean,
    public readonly stripePriceId: string | null,
    public readonly paypalPlanId: string | null,
    public readonly discounts: PlanDiscountDto[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
