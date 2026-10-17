import { AggregateRoot, BusinessRuleViolationError } from '@modules/shared/domain';
import {
  BillingEventId,
  BillingEventType,
  PaymentProvider,
} from '../value-objects';

export interface BillingEventProps {
  id: BillingEventId;
  orgId: string;
  subscriptionId: string | null;
  type: BillingEventType;
  provider: PaymentProvider;
  providerEventId: string;
  amount: number | null;
  currency: string | null;
  metadata: Record<string, any>;
  occurredAt: Date;
  createdAt: Date;
}

export class BillingEvent extends AggregateRoot<BillingEventId> {
  private _orgId: string;
  private _subscriptionId: string | null;
  private _type: BillingEventType;
  private _provider: PaymentProvider;
  private _providerEventId: string;
  private _amount: number | null;
  private _currency: string | null;
  private _metadata: Record<string, any>;
  private _occurredAt: Date;
  private _createdAt: Date;

  protected constructor(props: BillingEventProps) {
    super(props.id);
    this._orgId = props.orgId;
    this._subscriptionId = props.subscriptionId;
    this._type = props.type;
    this._provider = props.provider;
    this._providerEventId = props.providerEventId;
    this._amount = props.amount;
    this._currency = props.currency;
    this._metadata = props.metadata;
    this._occurredAt = new Date(props.occurredAt);
    this._createdAt = new Date(props.createdAt);
  }

  public static create(props: {
    id?: BillingEventId;
    orgId: string;
    subscriptionId?: string | null;
    type: BillingEventType;
    provider: PaymentProvider;
    providerEventId: string;
    amount?: number | null;
    currency?: string | null;
    metadata?: Record<string, any>;
    occurredAt?: Date;
  }): BillingEvent {
    if (!props.providerEventId) {
      throw new BusinessRuleViolationError('Provider event ID is required for billing events.');
    }

    return new BillingEvent({
      id: props.id ?? BillingEventId.create(),
      orgId: props.orgId,
      subscriptionId: props.subscriptionId ?? null,
      type: props.type,
      provider: props.provider,
      providerEventId: props.providerEventId,
      amount: props.amount ?? null,
      currency: props.currency ? props.currency.toUpperCase() : null,
      metadata: props.metadata ?? {},
      occurredAt: props.occurredAt ?? new Date(),
      createdAt: new Date(),
    });
  }

  public static reconstitute(props: BillingEventProps): BillingEvent {
    return new BillingEvent(props);
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get subscriptionId(): string | null {
    return this._subscriptionId;
  }

  public get type(): BillingEventType {
    return this._type;
  }

  public get provider(): PaymentProvider {
    return this._provider;
  }

  public get providerEventId(): string {
    return this._providerEventId;
  }

  public get amount(): number | null {
    return this._amount;
  }

  public get currency(): string | null {
    return this._currency;
  }

  public get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  public get occurredAt(): Date {
    return new Date(this._occurredAt);
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }
}
