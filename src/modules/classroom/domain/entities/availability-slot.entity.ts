import { AvailabilitySlotId } from '../value-objects/availability-slot-id.vo';

export interface AvailabilitySlotProps {
  id: AvailabilitySlotId;
  dayOfWeek: number; // 0-6 (0 = Sunday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
}

export class AvailabilitySlot {
  public readonly id: AvailabilitySlotId;
  private _dayOfWeek: number;
  private _startTime: string;
  private _endTime: string;
  private _timezone: string;

  private constructor(props: AvailabilitySlotProps) {
    this.id = props.id;
    this._dayOfWeek = props.dayOfWeek;
    this._startTime = props.startTime;
    this._endTime = props.endTime;
    this._timezone = props.timezone;
  }

  public static create(props: Omit<AvailabilitySlotProps, 'id'> & { id?: AvailabilitySlotId }): AvailabilitySlot {
    if (props.dayOfWeek < 0 || props.dayOfWeek > 6) {
      throw new Error('dayOfWeek must be between 0 (Sunday) and 6 (Saturday)');
    }
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(props.startTime)) {
      throw new Error('startTime must be in HH:mm format');
    }
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(props.endTime)) {
      throw new Error('endTime must be in HH:mm format');
    }
    if (props.startTime >= props.endTime) {
      throw new Error('startTime must be strictly before endTime');
    }

    return new AvailabilitySlot({
      id: props.id ?? AvailabilitySlotId.create(),
      dayOfWeek: props.dayOfWeek,
      startTime: props.startTime,
      endTime: props.endTime,
      timezone: props.timezone,
    });
  }

  public static reconstitute(props: AvailabilitySlotProps): AvailabilitySlot {
    return new AvailabilitySlot(props);
  }

  public get dayOfWeek(): number {
    return this._dayOfWeek;
  }

  public get startTime(): string {
    return this._startTime;
  }

  public get endTime(): string {
    return this._endTime;
  }

  public get timezone(): string {
    return this._timezone;
  }
}
