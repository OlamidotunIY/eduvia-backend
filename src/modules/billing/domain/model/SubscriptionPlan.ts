import { AggregateRoot, BusinessRuleViolationError } from '@modules/shared/domain';
import {
  SubscriptionPlanId,
  BillingInterval,
  PlanDiscountId,
} from '../value-objects';
import { PlanDiscount } from '../entities/plan-discount.entity';
import { SubscriptionPlanCreatedEvent } from '../events';

export interface SubscriptionPlanProps {
  id: SubscriptionPlanId;
  orgId: string;
  subjectId: string;
  name: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  billingInterval: BillingInterval;
  lessonsPerInterval: number;
  isActive: boolean;
  stripePriceId: string | null;
  paypalPlanId: string | null;
  discounts: PlanDiscount[];
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriptionPlan extends AggregateRoot<SubscriptionPlanId> {
  private _orgId: string;
  private _subjectId: string;
  private _name: string;
  private _description: string | null;
  private _priceAmount: number;
  private _currency: string;
  private _billingInterval: BillingInterval;
  private _lessonsPerInterval: number;
  private _isActive: boolean;
  private _stripePriceId: string | null;
  private _paypalPlanId: string | null;
  private _discounts: PlanDiscount[];
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: SubscriptionPlanProps) {
    super(props.id);
    this._orgId = props.orgId;
    this._subjectId = props.subjectId;
    this._name = props.name;
    this._description = props.description;
    this._priceAmount = props.priceAmount;
    this._currency = props.currency;
    this._billingInterval = props.billingInterval;
    this._lessonsPerInterval = props.lessonsPerInterval;
    this._isActive = props.isActive;
    this._stripePriceId = props.stripePriceId;
    this._paypalPlanId = props.paypalPlanId;
    this._discounts = [...props.discounts];
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(props: {
    id?: SubscriptionPlanId;
    orgId: string;
    subjectId: string;
    name: string;
    description?: string | null;
    priceAmount: number;
    currency: string;
    billingInterval: BillingInterval;
    lessonsPerInterval: number;
    stripePriceId?: string | null;
    paypalPlanId?: string | null;
    correlationId?: string;
  }): SubscriptionPlan {
    if (props.priceAmount <= 0) {
      throw new BusinessRuleViolationError('Plan price must be greater than zero.');
    }
    if (props.lessonsPerInterval <= 0) {
      throw new BusinessRuleViolationError('Lessons per interval must be at least 1.');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new BusinessRuleViolationError('Plan name is required.');
    }

    const planId = props.id ?? SubscriptionPlanId.create();
    const now = new Date();

    const plan = new SubscriptionPlan({
      id: planId,
      orgId: props.orgId,
      subjectId: props.subjectId,
      name: props.name.trim(),
      description: props.description ?? null,
      priceAmount: props.priceAmount,
      currency: props.currency.toUpperCase(),
      billingInterval: props.billingInterval,
      lessonsPerInterval: props.lessonsPerInterval,
      isActive: true,
      stripePriceId: props.stripePriceId ?? null,
      paypalPlanId: props.paypalPlanId ?? null,
      discounts: [],
      createdAt: now,
      updatedAt: now,
    });

    plan.addDomainEvent(
      new SubscriptionPlanCreatedEvent(
        planId.value,
        new SubscriptionPlanCreatedEvent.Payload(
          planId.value,
          props.orgId,
          props.subjectId,
          plan.name,
          props.priceAmount,
          plan.currency,
          props.billingInterval,
          props.lessonsPerInterval,
        ),
        props.correlationId ?? planId.value,
      ),
    );

    return plan;
  }

  public static reconstitute(props: SubscriptionPlanProps): SubscriptionPlan {
    return new SubscriptionPlan(props);
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get subjectId(): string {
    return this._subjectId;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string | null {
    return this._description;
  }

  public get priceAmount(): number {
    return this._priceAmount;
  }

  public get currency(): string {
    return this._currency;
  }

  public get billingInterval(): BillingInterval {
    return this._billingInterval;
  }

  public get lessonsPerInterval(): number {
    return this._lessonsPerInterval;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get stripePriceId(): string | null {
    return this._stripePriceId;
  }

  public get paypalPlanId(): string | null {
    return this._paypalPlanId;
  }

  public get discounts(): ReadonlyArray<PlanDiscount> {
    return [...this._discounts];
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  public deactivate(): void {
    this._isActive = false;
    this._touch();
  }

  public activate(): void {
    this._isActive = true;
    this._touch();
  }

  public setStripePriceId(priceId: string): void {
    this._stripePriceId = priceId;
    this._touch();
  }

  public setPayPalPlanId(planId: string): void {
    this._paypalPlanId = planId;
    this._touch();
  }

  public addDiscount(discount: PlanDiscount): void {
    const existing = this._discounts.find((d) => d.id.value === discount.id.value);
    if (existing) {
      throw new BusinessRuleViolationError(`Discount '${discount.id.value}' already exists on plan.`);
    }
    this._discounts.push(discount);
    this._touch();
  }

  public removeDiscount(discountId: PlanDiscountId): void {
    const discount = this._discounts.find((d) => d.id.value === discountId.value);
    if (discount) {
      discount.deactivate();
      this._touch();
    }
  }

  public findDiscount(discountId: PlanDiscountId): PlanDiscount | null {
    return this._discounts.find((d) => d.id.value === discountId.value) ?? null;
  }

  public applyDiscount(
    parentId: string,
    discountCode?: string,
  ): { discount: PlanDiscount | null; effectivePrice: number } {
    let matchedDiscount: PlanDiscount | null = null;

    for (const d of this._discounts) {
      if (d.isApplicable(parentId, discountCode)) {
        matchedDiscount = d;
        break;
      }
    }

    const effectivePrice = matchedDiscount
      ? matchedDiscount.calculateEffectivePrice(this._priceAmount)
      : this._priceAmount;

    return { discount: matchedDiscount, effectivePrice };
  }

  private _touch(): void {
    this._updatedAt = new Date();
  }
}
