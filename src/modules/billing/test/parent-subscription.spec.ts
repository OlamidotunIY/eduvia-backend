import {
  ParentSubscription,
  SubscriptionPlanId,
  PaymentProvider,
  SubscriptionStatus,
  SubscriptionCreatedEvent,
  SubscriptionCancelledEvent,
  SubscriptionPausedEvent,
  SubscriptionResumedEvent,
  SubscriptionPaymentFailedEvent,
  SubscriptionRenewedEvent,
} from '../domain';

describe('ParentSubscription Aggregate Root', () => {
  const orgId = '018f9210-9c24-7123-8345-abcdef123456';
  const planId = SubscriptionPlanId.create();
  const parentId = 'parent-123';
  const studentId = 'student-456';
  const subjectId = 'subject-789';

  const startDate = new Date('2025-01-01T00:00:00.000Z');
  const endDate = new Date('2025-02-01T00:00:00.000Z');

  it('should create an active parent subscription and emit SubscriptionCreatedEvent', () => {
    const subscription = ParentSubscription.create({
      orgId,
      planId,
      parentId,
      studentId,
      subjectId,
      provider: PaymentProvider.stripe,
      providerSubscriptionId: 'sub_stripe_12345',
      effectivePriceAmount: 8000,
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
    });

    expect(subscription).toBeDefined();
    expect(subscription.orgId).toBe(orgId);
    expect(subscription.status).toBe(SubscriptionStatus.active);
    expect(subscription.effectivePriceAmount).toBe(8000);
    expect(subscription.cancelledAt).toBeNull();

    const events = subscription.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(SubscriptionCreatedEvent);
    expect((events[0] as SubscriptionCreatedEvent).payload.subscriptionId).toBe(
      subscription.id.toString(),
    );
  });

  it('should cancel subscription and emit SubscriptionCancelledEvent', () => {
    const subscription = ParentSubscription.create({
      orgId,
      planId,
      parentId,
      studentId,
      subjectId,
      provider: PaymentProvider.stripe,
      providerSubscriptionId: 'sub_123',
      effectivePriceAmount: 8000,
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
    });
    subscription.pullDomainEvents();

    subscription.cancel('Moving to a different school');
    expect(subscription.status).toBe(SubscriptionStatus.cancelled);
    expect(subscription.cancelledAt).toBeDefined();
    expect(subscription.cancelReason).toBe('Moving to a different school');

    const events = subscription.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(SubscriptionCancelledEvent);
  });

  it('should pause and resume subscription', () => {
    const subscription = ParentSubscription.create({
      orgId,
      planId,
      parentId,
      studentId,
      subjectId,
      provider: PaymentProvider.stripe,
      providerSubscriptionId: 'sub_123',
      effectivePriceAmount: 8000,
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
    });
    subscription.pullDomainEvents();

    subscription.pause();
    expect(subscription.status).toBe(SubscriptionStatus.paused);
    let events = subscription.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(SubscriptionPausedEvent);

    subscription.resume();
    expect(subscription.status).toBe(SubscriptionStatus.active);
    events = subscription.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(SubscriptionResumedEvent);
  });

  it('should mark past due and emit SubscriptionPaymentFailedEvent', () => {
    const subscription = ParentSubscription.create({
      orgId,
      planId,
      parentId,
      studentId,
      subjectId,
      provider: PaymentProvider.stripe,
      providerSubscriptionId: 'sub_123',
      effectivePriceAmount: 8000,
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
    });
    subscription.pullDomainEvents();

    subscription.markPastDue();
    expect(subscription.status).toBe(SubscriptionStatus.past_due);

    const events = subscription.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(SubscriptionPaymentFailedEvent);
  });

  it('should renew subscription and emit SubscriptionRenewedEvent', () => {
    const subscription = ParentSubscription.create({
      orgId,
      planId,
      parentId,
      studentId,
      subjectId,
      provider: PaymentProvider.stripe,
      providerSubscriptionId: 'sub_123',
      effectivePriceAmount: 8000,
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
    });
    subscription.pullDomainEvents();

    const renewedEndDate = new Date('2025-03-01T00:00:00.000Z');
    subscription.renew(renewedEndDate);

    expect(subscription.status).toBe(SubscriptionStatus.active);
    expect(subscription.currentPeriodStart).toEqual(endDate);
    expect(subscription.currentPeriodEnd).toEqual(renewedEndDate);

    const events = subscription.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(SubscriptionRenewedEvent);
  });
});
