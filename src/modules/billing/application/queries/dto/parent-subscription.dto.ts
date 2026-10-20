export class ParentSubscriptionDto {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly planId: string,
    public readonly parentId: string,
    public readonly studentId: string,
    public readonly subjectId: string,
    public readonly provider: string,
    public readonly providerSubscriptionId: string,
    public readonly status: string,
    public readonly discountId: string | null,
    public readonly effectivePriceAmount: number,
    public readonly currentPeriodStart: Date,
    public readonly currentPeriodEnd: Date,
    public readonly cancelledAt: Date | null,
    public readonly cancelReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
