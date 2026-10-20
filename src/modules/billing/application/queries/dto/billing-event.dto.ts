export class BillingEventDto {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly subscriptionId: string | null,
    public readonly type: string,
    public readonly provider: string,
    public readonly providerEventId: string,
    public readonly amount: number | null,
    public readonly currency: string | null,
    public readonly metadata: Record<string, any>,
    public readonly occurredAt: Date,
    public readonly createdAt: Date,
  ) {}
}
