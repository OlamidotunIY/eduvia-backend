import {
  SubscriptionPlan,
  BillingInterval,
  SubscriptionPlanCreatedEvent,
  PlanDiscount,
  DiscountType,
  DiscountScope,
} from '../domain';

describe('SubscriptionPlan Aggregate Root', () => {
  const orgId = '018f9210-9c24-7123-8345-abcdef123456';
  const subjectId = '018f9210-9c24-7123-8345-subject12345';

  it('should create a subscription plan and emit SubscriptionPlanCreatedEvent', () => {
    const plan = SubscriptionPlan.create({
      orgId,
      subjectId,
      name: 'GCSE Maths Weekly',
      description: 'One lesson per week for GCSE Maths',
      priceAmount: 8000,
      currency: 'GBP',
      billingInterval: BillingInterval.monthly,
      lessonsPerInterval: 4,
    });

    expect(plan).toBeDefined();
    expect(plan.name).toBe('GCSE Maths Weekly');
    expect(plan.priceAmount).toBe(8000);
    expect(plan.currency).toBe('GBP');
    expect(plan.billingInterval).toBe(BillingInterval.monthly);
    expect(plan.lessonsPerInterval).toBe(4);
    expect(plan.isActive).toBe(true);
    expect(plan.discounts).toHaveLength(0);

    const events = plan.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(SubscriptionPlanCreatedEvent);
    expect((events[0] as SubscriptionPlanCreatedEvent).payload.priceAmount).toBe(8000);
  });

  it('should throw error if price is not positive or lessons per interval < 1', () => {
    expect(() =>
      SubscriptionPlan.create({
        orgId,
        subjectId,
        name: 'Invalid Plan',
        priceAmount: 0,
        currency: 'GBP',
        billingInterval: BillingInterval.monthly,
        lessonsPerInterval: 4,
      }),
    ).toThrow('Plan price must be greater than zero.');

    expect(() =>
      SubscriptionPlan.create({
        orgId,
        subjectId,
        name: 'Invalid Plan',
        priceAmount: 5000,
        currency: 'GBP',
        billingInterval: BillingInterval.monthly,
        lessonsPerInterval: 0,
      }),
    ).toThrow('Lessons per interval must be at least 1.');
  });

  it('should deactivate and activate plan', () => {
    const plan = SubscriptionPlan.create({
      orgId,
      subjectId,
      name: 'GCSE Maths Weekly',
      priceAmount: 8000,
      currency: 'GBP',
      billingInterval: BillingInterval.monthly,
      lessonsPerInterval: 4,
    });

    plan.deactivate();
    expect(plan.isActive).toBe(false);

    plan.activate();
    expect(plan.isActive).toBe(true);
  });

  it('should add and apply percentage discounts correctly', () => {
    const plan = SubscriptionPlan.create({
      orgId,
      subjectId,
      name: 'GCSE Maths Weekly',
      priceAmount: 10000,
      currency: 'GBP',
      billingInterval: BillingInterval.monthly,
      lessonsPerInterval: 4,
    });

    const discount = PlanDiscount.create({
      planId: plan.id,
      type: DiscountType.percentage,
      amount: 20,
      scope: DiscountScope.all_parents,
      code: 'SUMMER20',
    });

    plan.addDiscount(discount);
    expect(plan.discounts).toHaveLength(1);

    const result = plan.applyDiscount('parent-1', 'SUMMER20');
    expect(result.discount).toBeDefined();
    expect(result.effectivePrice).toBe(8000); // 10000 - 20%
  });

  it('should apply specific parent fixed discount', () => {
    const plan = SubscriptionPlan.create({
      orgId,
      subjectId,
      name: 'GCSE Maths Weekly',
      priceAmount: 10000,
      currency: 'GBP',
      billingInterval: BillingInterval.monthly,
      lessonsPerInterval: 4,
    });

    const discount = PlanDiscount.create({
      planId: plan.id,
      type: DiscountType.fixed_amount,
      amount: 2500,
      scope: DiscountScope.specific_parent,
      parentId: 'special-parent-id',
    });

    plan.addDiscount(discount);

    // Unrelated parent should not get the discount
    const otherParentResult = plan.applyDiscount('other-parent');
    expect(otherParentResult.discount).toBeNull();
    expect(otherParentResult.effectivePrice).toBe(10000);

    // Targeted parent should receive discount
    const targetParentResult = plan.applyDiscount('special-parent-id');
    expect(targetParentResult.discount).toBeDefined();
    expect(targetParentResult.effectivePrice).toBe(7500); // 10000 - 2500
  });
});
