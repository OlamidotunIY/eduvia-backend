import { OutBoxMessageType, OutboxStatus } from '../value-object';
import { AggregateRoot } from './aggregate-root';

export class OutboxMessage extends AggregateRoot<number> {
  private readonly _type: string;
  private readonly _payload: Record<string, unknown>;
  private readonly _aggregateType: string;
  private readonly _aggregateId: number;
  private readonly _status: OutboxStatus;
  private readonly createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(params: OutBoxMessageType) {
    super(params.id);
    this._aggregateId = params.aggregateId;
    this._status = params.status;
    this._aggregateType = params.aggregateType;
    this._payload = params.payload;
    this._type = params.type;
    this._updatedAt = new Date();
    this.createdAt = new Date();
  }

  public getId(): number {
    return this.id;
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

  public aggregateId(): number {
    return this._aggregateId;
  }

  public status(): OutboxStatus {
    return this._status;
  }

  public updatedAt(): Date {
    return this._updatedAt;
  }
}
