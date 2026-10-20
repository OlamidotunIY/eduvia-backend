import {
  OrgBillingAccount,
  BillingModel,
  PaymentProvider,
  OrgPlanTier,
  BillingAccountStatus,
  OrgBillingAccountCreatedEvent,
  OrgPlanUpgradedEvent,
  OrgBillingSuspendedEvent,
} from '../domain';

describe('OrgBillingAccount Aggregate Root', () => {
  const orgId = '018f9210-9c24-7123-8345-abcdef123456';

  it('should create a billing account with default free tier and emit OrgBillingAccountCreatedEvent', () => {
    const account = OrgBillingAccount.create({
      orgId,
      billingModel: BillingModel.marketplace,
    });

    expect(account).toBeDefined();
    expect(account.orgId).toBe(orgId);
    expect(account.billingModel).toBe(BillingModel.marketplace);
    expect(account.planTier).toBe(OrgPlanTier.free);
    expect(account.freeTierActive).toBe(true);
    expect(account.status).toBe(BillingAccountStatus.active);
    expect(account.seatCount).toBe(0);
    expect(account.stripeAccountId).toBeNull();
    expect(account.paypalMerchantId).toBeNull();

    const events = account.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrgBillingAccountCreatedEvent);
    expect((events[0] as OrgBillingAccountCreatedEvent).payload.orgId).toBe(orgId);
  });

  it('should connect Stripe account and set provider to stripe', () => {
    const account = OrgBillingAccount.create({
      orgId,
      billingModel: BillingModel.marketplace,
    });
    account.pullDomainEvents();

    account.connectStripe('acct_123456789');
    expect(account.stripeAccountId).toBe('acct_123456789');
    expect(account.paymentProvider).toBe(PaymentProvider.stripe);
    expect(account.canCreateMarketplacePlan()).toBe(true);
  });

  it('should connect PayPal merchant and set provider to paypal', () => {
    const account = OrgBillingAccount.create({
      orgId,
      billingModel: BillingModel.marketplace,
    });
    account.pullDomainEvents();

    account.connectPayPal('merchant_paypal_123');
    expect(account.paypalMerchantId).toBe('merchant_paypal_123');
    expect(account.paymentProvider).toBe(PaymentProvider.paypal);
    expect(account.canCreateMarketplacePlan()).toBe(true);
  });

  it('should return false for canCreateMarketplacePlan if neither provider is connected', () => {
    const account = OrgBillingAccount.create({
      orgId,
      billingModel: BillingModel.marketplace,
    });

    expect(account.canCreateMarketplacePlan()).toBe(false);
  });

  it('should return false for canCreateMarketplacePlan if model is SaaS', () => {
    const account = OrgBillingAccount.create({
      orgId,
      billingModel: BillingModel.saas,
    });
    account.connectStripe('acct_12345');

    expect(account.canCreateMarketplacePlan()).toBe(false);
  });

  it('should upgrade tier and emit OrgPlanUpgradedEvent', () => {
    const account = OrgBillingAccount.create({
      orgId,
      billingModel: BillingModel.saas,
      planTier: OrgPlanTier.starter,
    });
    account.pullDomainEvents();

    account.upgradeTier(OrgPlanTier.professional);
    expect(account.planTier).toBe(OrgPlanTier.professional);
    expect(account.freeTierActive).toBe(false);

    const events = account.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrgPlanUpgradedEvent);
    expect((events[0] as OrgPlanUpgradedEvent).payload.newTier).toBe(OrgPlanTier.professional);
  });

  it('should suspend and reactivate account with events', () => {
    const account = OrgBillingAccount.create({
      orgId,
      billingModel: BillingModel.saas,
    });
    account.pullDomainEvents();

    account.suspend('Payment failed repeatedly');
    expect(account.status).toBe(BillingAccountStatus.suspended);

    const events = account.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrgBillingSuspendedEvent);

    account.reactivate();
    expect(account.status).toBe(BillingAccountStatus.active);
  });

  it('should update seat count and validate non-negative values', () => {
    const account = OrgBillingAccount.create({
      orgId,
      billingModel: BillingModel.saas,
    });

    account.updateSeatCount(25);
    expect(account.seatCount).toBe(25);

    expect(() => account.updateSeatCount(-5)).toThrow('Seat count cannot be negative.');
  });
});
