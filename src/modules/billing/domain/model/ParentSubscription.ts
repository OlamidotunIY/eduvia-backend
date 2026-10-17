import { AggregateRoot, BusinessRuleViolationError } from '@modules/shared/domain';
import {
  ParentSubscriptionId,
  SubscriptionPlanId,
  PaymentProvider,
  SubscriptionStatus,
  PlanDiscountId,
} from '../value-objects';
import {
  SubscriptionCreatedEvent,
  SubscriptionCancelledEvent,
  SubscriptionPausedEvent,
  SubscriptionResumedEvent,
  SubscriptionPaymentFailedEvent,
  SubscriptionRenewedEvent,
} from '../events';

export interface ParentSubscriptionProps {
  id: ParentSubscriptionId;
  orgId: string;
  planId: SubscriptionPlanId;
  parentId: string;
  studentId: string;
  subjectId: string;
  provider: PaymentProvider;
  providerSubscriptionId: string;
  status: SubscriptionStatus;
  discountId: PlanDiscountId | null;
  effectivePriceAmount: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ParentSubscription extends AggregateRoot<ParentSubscriptionId> {
  private _orgId: string;
  private _planId: SubscriptionPlanId;
  private _parentId: string;
  private _studentId: string;
  private _subjectId: string;
  private _provider: PaymentProvider;
  private _providerSubscriptionId: string;
  private _status: SubscriptionStatus;
  private _discountId: PlanDiscountId | null;
  private _effectivePriceAmount: number;
  private _currentPeriodStart: Date;
  private _currentPeriodEnd: Date;
  private _cancelledAt: Date | null;
  private _cancelReason: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: ParentSubscriptionProps) {
    super(props.id);
    this._orgId = props.orgId;
    this._planId = props.planId;
    this._parentId = props.parentId;
    this._studentId = props.studentId;
    this._subjectId = props.subjectId;
    this._provider = props.provider;
    this._providerSubscriptionId = props.providerSubscriptionId;
    this._status = props.status;
    this._discountId = props.discountId;
    this._effectivePriceAmount = props.effectivePriceAmount;
    this._currentPeriodStart = new Date(props.currentPeriodStart);
    this._currentPeriodEnd = new Date(props.currentPeriodEnd);
    this._cancelledAt = props.cancelledAt ? new Date(props.cancelledAt) : null;
    this._cancelReason = props.cancelReason;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(props: {
    id?: ParentSubscriptionId;
    orgId: string;
    planId: SubscriptionPlanId;
    parentId: string;
    studentId: string;
    subjectId: string;
    provider: PaymentProvider;
    providerSubscriptionId: string;
    discountId?: PlanDiscountId | null;
    effectivePriceAmount: number;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    status?: SubscriptionStatus;
    correlationId?: string;
  }): ParentSubscription {
    if (props.effectivePriceAmount < 0) {
      throw new BusinessRuleViolationError('Effective price amount cannot be negative.');
    }
    if (props.currentPeriodEnd <= props.currentPeriodStart) {
      throw new BusinessRuleViolationError('Current period end must be after current period start.');
    }

    const subscriptionId = props.id ?? ParentSubscriptionId.create();
    const now = new Date();
    const status = props.status ?? SubscriptionStatus.active;

    const subscription = new ParentSubscription({
      id: subscriptionId,
      orgId: props.orgId,
      planId: props.planId,
      parentId: props.parentId,
      studentId: props.studentId,
      subjectId: props.subjectId,
      provider: props.provider,
      providerSubscriptionId: props.providerSubscriptionId,
      status,
      discountId: props.discountId ?? null,
      effectivePriceAmount: props.effectivePriceAmount,
      currentPeriodStart: props.currentPeriodStart,
      currentPeriodEnd: props.currentPeriodEnd,
      cancelledAt: null,
      cancelReason: null,
      createdAt: now,
      updatedAt: now,
    });

    subscription.addDomainEvent(
      new SubscriptionCreatedEvent(
        subscriptionId.value,
        new SubscriptionCreatedEvent.Payload(
          subscriptionId.value,
          props.orgId,
          props.planId.value,
          props.parentId,
          props.studentId,
          props.subjectId,
          props.provider,
          props.effectivePriceAmount,
          props.currentPeriodStart,
          props.currentPeriodEnd,
        ),
        props.correlationId ?? subscriptionId.value,
      ),
    );

    return subscription;
  }

  public static reconstitute(props: ParentSubscriptionProps): ParentSubscription {
    return new ParentSubscription(props);
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get planId(): SubscriptionPlanId {
    return this._planId;
  }

  public get parentId(): string {
    return this._parentId;
  }

  public get studentId(): string {
    return this._studentId;
  }

  public get subjectId(): string {
    return this._subjectId;
  }

  public get provider(): PaymentProvider {
    return this._provider;
  }

  public get providerSubscriptionId(): string {
    return this._providerSubscriptionId;
  }

  public get status(): SubscriptionStatus {
    return this._status;
  }

  public get discountId(): PlanDiscountId | null {
    return this._discountId;
  }

  public get effectivePriceAmount(): number {
    return this._effectivePriceAmount;
  }

  public get currentPeriodStart(): Date {
    return new Date(this._currentPeriodStart);
  }

  public get currentPeriodEnd(): Date {
    return new Date(this._currentPeriodEnd);
  }

  public get cancelledAt(): Date | null {
    return this._cancelledAt ? new Date(this._cancelledAt) : null;
  }

  public get cancelReason(): string | null {
    return this._cancelReason;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  public cancel(reason?: string, correlationId?: string): void {
    if (this._status === SubscriptionStatus.cancelled) {
      return;
    }
    this._status = SubscriptionStatus.cancelled;
    this._cancelledAt = new Date();
    this._cancelReason = reason ?? null;
    this._touch();

    this.addDomainEvent(
      new SubscriptionCancelledEvent(
        this.id.value,
        new SubscriptionCancelledEvent.Payload(
          this.id.value,
          this._orgId,
          this._parentId,
          this._studentId,
          this._subjectId,
          reason,
        ),
        correlationId ?? this.id.value,
      ),
    );
  }

  public pause(correlationId?: string): void {
    if (this._status === SubscriptionStatus.paused) {
      return;
    }
    if (this._status === SubscriptionStatus.cancelled) {
      throw new BusinessRuleViolationError('Cannot pause a cancelled subscription.');
    }
    this._status = SubscriptionStatus.paused;
    this._touch();

    this.addDomainEvent(
      new SubscriptionPausedEvent(
        this.id.value,
        new SubscriptionPausedEvent.Payload(
          this.id.value,
          this._orgId,
          this._parentId,
          this._studentId,
          this._subjectId,
        ),
        correlationId ?? this.id.value,
      ),
    );
  }

  public resume(correlationId?: string): void {
    if (this._status !== SubscriptionStatus.paused) {
      throw new BusinessRuleViolationError('Only paused subscriptions can be resumed.');
    }
    this._status = SubscriptionStatus.active;
    this._touch();

    this.addDomainEvent(
      new SubscriptionResumedEvent(
        this.id.value,
        new SubscriptionResumedEvent.Payload(
          this.id.value,
          this._orgId,
          this._parentId,
          this._studentId,
          this._subjectId,
        ),
        correlationId ?? this.id.value,
      ),
    );
  }

  public markPastDue(correlationId?: string): void {
    if (this._status === SubscriptionStatus.past_due) {
      return;
    }
    this._status = SubscriptionStatus.past_due;
    this._touch();

    this.addDomainEvent(
      new SubscriptionPaymentFailedEvent(
        this.id.value,
        new SubscriptionPaymentFailedEvent.Payload(
          this.id.value,
          this._orgId,
          this._parentId,
          this._studentId,
          this._subjectId,
        ),
        correlationId ?? this.id.value,
      ),
    );
  }

  public renew(newPeriodEnd: Date, correlationId?: string): void {
    if (newPeriodEnd <= this._currentPeriodEnd) {
      throw new BusinessRuleViolationError('New period end must be later than current period end.');
    }
    this._currentPeriodStart = new Date(this._currentPeriodEnd);
    this._currentPeriodEnd = new Date(newPeriodEnd);
    this._status = SubscriptionStatus.active;
    this._touch();

    this.addDomainEvent(
      new SubscriptionRenewedEvent(
        this.id.value,
        new SubscriptionRenewedEvent.Payload(
          this.id.value,
          this._orgId,
          this._parentId,
          this._studentId,
          this._subjectId,
          newPeriodEnd,
        ),
        correlationId ?? this.id.value,
      ),
    );
  }

  private _touch(): void {
    this._updatedAt = new Date();
  }
}
