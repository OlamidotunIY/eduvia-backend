import { OutBoxMessageType, OutboxStatus } from '../value-object';
import { AggregateRoot } from './aggregate-root';
import { OutboxMessageId } from '../value-object/outbox-message-id.vo';

export class OutboxMessage extends AggregateRoot<OutboxMessageId> {
  private readonly _eventId: string;
  private readonly _type: string;
  private readonly _payload: Record<string, unknown>;
  private readonly _aggregateType: string;
  private readonly _aggregateId: string;
  private readonly _correlationId: string;
  private readonly _occurredAt: Date;
  private readonly _status: OutboxStatus;
  private readonly createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(params: OutBoxMessageType) {
    super(OutboxMessageId.from(params.id));
    this._eventId = params.eventId;
    this._aggregateId = params.aggregateId;
    this._correlationId = params.correlationId;
    this._occurredAt = params.occurredAt;
    this._status = params.status;
    this._aggregateType = params.aggregateType;
    this._payload = params.payload;
    this._type = params.type;
    this._updatedAt = new Date();
    this.createdAt = new Date();
  }

  public eventId(): string {
    return this._eventId;
  }

  public type(): string {
    return this._type;
  }

  public payload(): Record<string, unknown> {
    return this._payload;
  }

  public aggregateType(): string {
    return this._aggregateType;
  }

  public aggregateId(): string {
    return this._aggregateId;
  }

  public correlationId(): string {
    return this._correlationId;
  }

  public occurredAt(): Date {
    return this._occurredAt;
  }

  public status(): OutboxStatus {
    return this._status;
  }

  public updatedAt(): Date {
    return this._updatedAt;
  }
}
