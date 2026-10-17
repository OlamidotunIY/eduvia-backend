import { BusinessRuleViolationError } from '@modules/shared/domain';
import { SeatUsageRecordId } from '../value-objects';

export interface SeatUsageRecordProps {
  id: SeatUsageRecordId;
  orgId: string;
  month: string;
  seatCount: number;
  tierAtTime: string;
  invoicedAt: Date | null;
  createdAt: Date;
}

export class SeatUsageRecord {
  private _id: SeatUsageRecordId;
  private _orgId: string;
  private _month: string;
  private _seatCount: number;
  private _tierAtTime: string;
  private _invoicedAt: Date | null;
  private _createdAt: Date;

  protected constructor(props: SeatUsageRecordProps) {
    this._id = props.id;
    this._orgId = props.orgId;
    this._month = props.month;
    this._seatCount = props.seatCount;
    this._tierAtTime = props.tierAtTime;
    this._invoicedAt = props.invoicedAt ? new Date(props.invoicedAt) : null;
    this._createdAt = new Date(props.createdAt);
  }

  public static create(props: {
    id?: SeatUsageRecordId;
    orgId: string;
    month: string;
    seatCount: number;
    tierAtTime: string;
    invoicedAt?: Date | null;
  }): SeatUsageRecord {
    if (props.seatCount < 0) {
      throw new BusinessRuleViolationError('Seat count cannot be negative.');
    }
    return new SeatUsageRecord({
      id: props.id ?? SeatUsageRecordId.create(),
      orgId: props.orgId,
      month: props.month,
      seatCount: props.seatCount,
      tierAtTime: props.tierAtTime,
      invoicedAt: props.invoicedAt ?? null,
      createdAt: new Date(),
    });
  }

  public static reconstitute(props: SeatUsageRecordProps): SeatUsageRecord {
    return new SeatUsageRecord(props);
  }

  public get id(): SeatUsageRecordId {
    return this._id;
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get month(): string {
    return this._month;
  }

  public get seatCount(): number {
    return this._seatCount;
  }

  public get tierAtTime(): string {
    return this._tierAtTime;
  }

  public get invoicedAt(): Date | null {
    return this._invoicedAt ? new Date(this._invoicedAt) : null;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public updateSeatCount(count: number): void {
    if (count < 0) {
      throw new BusinessRuleViolationError('Seat count cannot be negative.');
    }
    this._seatCount = count;
  }

  public markInvoiced(invoicedAt: Date = new Date()): void {
    this._invoicedAt = new Date(invoicedAt);
  }
}
