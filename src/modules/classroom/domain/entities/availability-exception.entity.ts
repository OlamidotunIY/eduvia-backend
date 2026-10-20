import { AvailabilityExceptionId } from '../value-objects/availability-exception-id.vo';
import { ExceptionType } from '../value-objects/exception-type.vo';

export interface AvailabilityExceptionProps {
  id: AvailabilityExceptionId;
  date: Date;
  type: ExceptionType;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}

export class AvailabilityException {
  public readonly id: AvailabilityExceptionId;
  private _date: Date;
  private _type: ExceptionType;
  private _startTime: string | null;
  private _endTime: string | null;
  private _reason: string | null;

  private constructor(props: AvailabilityExceptionProps) {
    this.id = props.id;
    this._date = props.date;
    this._type = props.type;
    this._startTime = props.startTime ?? null;
    this._endTime = props.endTime ?? null;
    this._reason = props.reason ?? null;
  }

  public static create(
    props: Omit<AvailabilityExceptionProps, 'id'> & { id?: AvailabilityExceptionId },
  ): AvailabilityException {
    if (props.type === ExceptionType.ADDED) {
      if (!props.startTime || !props.endTime) {
        throw new Error('Added exceptions require startTime and endTime');
      }
      if (props.startTime >= props.endTime) {
        throw new Error('startTime must be strictly before endTime');
      }
    }

    return new AvailabilityException({
      id: props.id ?? AvailabilityExceptionId.create(),
      date: props.date,
      type: props.type,
      startTime: props.startTime,
      endTime: props.endTime,
      reason: props.reason,
    });
  }

  public static reconstitute(props: AvailabilityExceptionProps): AvailabilityException {
    return new AvailabilityException(props);
  }

  public get date(): Date {
    return this._date;
  }

  public get type(): ExceptionType {
    return this._type;
  }

  public get startTime(): string | null {
    return this._startTime;
  }

  public get endTime(): string | null {
    return this._endTime;
  }

  public get reason(): string | null {
    return this._reason;
  }
}
