import { AggregateRoot, BusinessRuleViolationError } from '@modules/shared/domain';
import {
  OrgBillingAccountId,
  BillingModel,
  PaymentProvider,
  OrgPlanTier,
  BillingAccountStatus,
} from '../value-objects';
import {
  OrgBillingAccountCreatedEvent,
  OrgPlanUpgradedEvent,
  OrgBillingSuspendedEvent,
} from '../events';

export interface OrgBillingAccountProps {
  id: OrgBillingAccountId;
  orgId: string;
  billingModel: BillingModel;
  stripeAccountId: string | null;
  paypalMerchantId: string | null;
  paymentProvider: PaymentProvider | null;
  stripeCustomerId: string | null;
  seatCount: number;
  freeTierActive: boolean;
  planTier: OrgPlanTier;
  currentPeriodEnd: Date | null;
  status: BillingAccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class OrgBillingAccount extends AggregateRoot<OrgBillingAccountId> {
  private _orgId: string;
  private _billingModel: BillingModel;
  private _stripeAccountId: string | null;
  private _paypalMerchantId: string | null;
  private _paymentProvider: PaymentProvider | null;
  private _stripeCustomerId: string | null;
  private _seatCount: number;
  private _freeTierActive: boolean;
  private _planTier: OrgPlanTier;
  private _currentPeriodEnd: Date | null;
  private _status: BillingAccountStatus;
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: OrgBillingAccountProps) {
    super(props.id);
    this._orgId = props.orgId;
    this._billingModel = props.billingModel;
    this._stripeAccountId = props.stripeAccountId;
    this._paypalMerchantId = props.paypalMerchantId;
    this._paymentProvider = props.paymentProvider;
    this._stripeCustomerId = props.stripeCustomerId;
    this._seatCount = props.seatCount;
    this._freeTierActive = props.freeTierActive;
    this._planTier = props.planTier;
    this._currentPeriodEnd = props.currentPeriodEnd ? new Date(props.currentPeriodEnd) : null;
    this._status = props.status;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(props: {
    id?: OrgBillingAccountId;
    orgId: string;
    billingModel: BillingModel;
    planTier?: OrgPlanTier;
    stripeAccountId?: string | null;
    paypalMerchantId?: string | null;
    paymentProvider?: PaymentProvider | null;
    correlationId?: string;
  }): OrgBillingAccount {
    if (!props.orgId) {
      throw new BusinessRuleViolationError('Organization ID is required to create a billing account.');
    }

    const tier = props.planTier ?? OrgPlanTier.free;
    const isFree = tier === OrgPlanTier.free;
    const accountId = props.id ?? OrgBillingAccountId.create();
    const now = new Date();

    const account = new OrgBillingAccount({
      id: accountId,
      orgId: props.orgId,
      billingModel: props.billingModel,
      stripeAccountId: props.stripeAccountId ?? null,
      paypalMerchantId: props.paypalMerchantId ?? null,
      paymentProvider: props.paymentProvider ?? null,
      stripeCustomerId: null,
      seatCount: 0,
      freeTierActive: isFree,
      planTier: tier,
      currentPeriodEnd: null,
      status: BillingAccountStatus.active,
      createdAt: now,
      updatedAt: now,
    });

    account.record(
      new OrgBillingAccountCreatedEvent(
        accountId.value,
        new OrgBillingAccountCreatedEvent.Payload(
          accountId.value,
          props.orgId,
          props.billingModel,
          tier,
        ),
        props.correlationId ?? accountId.value,
      ),
    );

    return account;
  }

  public static reconstitute(props: OrgBillingAccountProps): OrgBillingAccount {
    return new OrgBillingAccount(props);
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get billingModel(): BillingModel {
    return this._billingModel;
  }

  public get stripeAccountId(): string | null {
    return this._stripeAccountId;
  }

  public get paypalMerchantId(): string | null {
    return this._paypalMerchantId;
  }

  public get paymentProvider(): PaymentProvider | null {
    return this._paymentProvider;
  }

  public get stripeCustomerId(): string | null {
    return this._stripeCustomerId;
  }

  public get seatCount(): number {
    return this._seatCount;
  }

  public get freeTierActive(): boolean {
    return this._freeTierActive;
  }

  public get planTier(): OrgPlanTier {
    return this._planTier;
  }

  public get currentPeriodEnd(): Date | null {
    return this._currentPeriodEnd ? new Date(this._currentPeriodEnd) : null;
  }

  public get status(): BillingAccountStatus {
    return this._status;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  public connectStripe(stripeAccountId: string): void {
    if (!stripeAccountId) {
      throw new BusinessRuleViolationError('Stripe account ID cannot be empty.');
    }
    this._stripeAccountId = stripeAccountId;
    this._paymentProvider = PaymentProvider.stripe;
    this._touch();
  }

  public connectPayPal(merchantId: string): void {
    if (!merchantId) {
      throw new BusinessRuleViolationError('PayPal merchant ID cannot be empty.');
    }
    this._paypalMerchantId = merchantId;
    this._paymentProvider = PaymentProvider.paypal;
    this._touch();
  }

  public setStripeCustomerId(customerId: string): void {
    this._stripeCustomerId = customerId;
    this._touch();
  }

  public upgradeTier(newTier: OrgPlanTier, correlationId?: string): void {
    if (this._planTier === newTier) {
      return;
    }
    const prevTier = this._planTier;
    this._planTier = newTier;
    this._freeTierActive = newTier === OrgPlanTier.free;
    this._touch();

    this.record(
      new OrgPlanUpgradedEvent(
        this.id.value,
        new OrgPlanUpgradedEvent.Payload(this.id.value, this._orgId, prevTier, newTier),
        correlationId ?? this.id.value,
      ),
    );
  }

  public suspend(reason?: string, correlationId?: string): void {
    if (this._status === BillingAccountStatus.suspended) {
      return;
    }
    this._status = BillingAccountStatus.suspended;
    this._touch();

    this.record(
      new OrgBillingSuspendedEvent(
        this.id.value,
        new OrgBillingSuspendedEvent.Payload(this.id.value, this._orgId, reason),
        correlationId ?? this.id.value,
      ),
    );
  }

  public reactivate(): void {
    this._status = BillingAccountStatus.active;
    this._touch();
  }

  public markPastDue(): void {
    this._status = BillingAccountStatus.past_due;
    this._touch();
  }

  public cancel(): void {
    this._status = BillingAccountStatus.cancelled;
    this._touch();
  }

  public updateSeatCount(count: number): void {
    if (count < 0) {
      throw new BusinessRuleViolationError('Seat count cannot be negative.');
    }
    this._seatCount = count;
    this._touch();
  }

  public updatePeriodEnd(date: Date): void {
    this._currentPeriodEnd = new Date(date);
    this._touch();
  }

  public canCreateMarketplacePlan(): boolean {
    if (this._billingModel !== BillingModel.marketplace) {
      return false;
    }
    return Boolean(this._stripeAccountId || this._paypalMerchantId);
  }

  private _touch(): void {
    this._updatedAt = new Date();
  }
}
