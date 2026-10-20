export class OrgBillingAccountDto {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly billingModel: string,
    public readonly stripeAccountId: string | null,
    public readonly paypalMerchantId: string | null,
    public readonly paymentProvider: string | null,
    public readonly stripeCustomerId: string | null,
    public readonly seatCount: number,
    public readonly freeTierActive: boolean,
    public readonly planTier: string,
    public readonly currentPeriodEnd: Date | null,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
