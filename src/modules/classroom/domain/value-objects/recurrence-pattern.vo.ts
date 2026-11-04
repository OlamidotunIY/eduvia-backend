export interface RecurrencePatternProps {
  daysOfWeek?: number[]; // 0-6 (0 = Sunday)
  /** @deprecated Use daysOfWeek. Retained while existing classrooms migrate. */
  dayOfWeek?: number;
  startTime: string; // HH:mm
  timezone: string;
  intervalWeeks: number;
  effectiveFrom: Date;
  effectiveUntil?: Date | null;
}

export class RecurrencePattern {
  readonly daysOfWeek: readonly number[];
  readonly startTime: string;
  readonly timezone: string;
  readonly intervalWeeks: number;
  readonly effectiveFrom: Date;
  readonly effectiveUntil: Date | null;

  private constructor(props: RecurrencePatternProps) {
    this.daysOfWeek = Object.freeze(RecurrencePattern.resolveDaysOfWeek(props));
    this.startTime = props.startTime;
    this.timezone = props.timezone;
    this.intervalWeeks = props.intervalWeeks;
    this.effectiveFrom = props.effectiveFrom;
    this.effectiveUntil = props.effectiveUntil ?? null;
    Object.freeze(this);
  }

  public static create(props: RecurrencePatternProps): RecurrencePattern {
    const daysOfWeek = this.resolveDaysOfWeek(props);
    if (
      daysOfWeek.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
    ) {
      throw new Error(
        'daysOfWeek must contain weekdays between 0 (Sunday) and 6 (Saturday)',
      );
    }
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(props.startTime)) {
      throw new Error('startTime must be in HH:mm format (00:00-23:59)');
    }
    if (!props.timezone || props.timezone.trim().length === 0) {
      throw new Error('timezone cannot be empty');
    }
    if (!props.intervalWeeks || props.intervalWeeks < 1) {
      throw new Error('intervalWeeks must be at least 1');
    }
    if (props.effectiveUntil && props.effectiveUntil <= props.effectiveFrom) {
      throw new Error('effectiveUntil must be strictly after effectiveFrom');
    }

    return new RecurrencePattern(props);
  }

  public nextOccurrence(after: Date): Date | null {
    const startPoint =
      after > this.effectiveFrom
        ? new Date(after)
        : new Date(this.effectiveFrom);
    const [hours, minutes] = this.startTime.split(':').map(Number);

    const current = new Date(startPoint);
    current.setSeconds(0, 0);

    // If current time on the same day is before scheduled time, start checking from today, else tomorrow
    const currentHours = current.getHours();
    const currentMins = current.getMinutes();
    if (
      this.daysOfWeek.includes(current.getDay()) &&
      (currentHours < hours ||
        (currentHours === hours && currentMins < minutes))
    ) {
      current.setHours(hours, minutes, 0, 0);
    } else {
      current.setDate(current.getDate() + 1);
      current.setHours(hours, minutes, 0, 0);
    }

    // Advance until a configured weekday matches.
    while (!this.daysOfWeek.includes(current.getDay())) {
      current.setDate(current.getDate() + 1);
    }

    if (this.effectiveUntil && current > this.effectiveUntil) {
      return null;
    }

    return current;
  }

  public equals(other: RecurrencePattern): boolean {
    if (!other) return false;
    return (
      this.daysOfWeek.length === other.daysOfWeek.length &&
      this.daysOfWeek.every((day, index) => day === other.daysOfWeek[index]) &&
      this.startTime === other.startTime &&
      this.timezone === other.timezone &&
      this.intervalWeeks === other.intervalWeeks &&
      this.effectiveFrom.getTime() === other.effectiveFrom.getTime() &&
      this.effectiveUntil?.getTime() === other.effectiveUntil?.getTime()
    );
  }

  /** The first scheduled weekday. Kept for one-release response compatibility. */
  public get dayOfWeek(): number {
    return this.daysOfWeek[0];
  }

  private static resolveDaysOfWeek(props: RecurrencePatternProps): number[] {
    const suppliedDays =
      props.daysOfWeek ??
      (props.dayOfWeek === undefined ? [] : [props.dayOfWeek]);
    const daysOfWeek = [...new Set(suppliedDays)].sort(
      (left, right) => left - right,
    );
    if (daysOfWeek.length === 0) {
      throw new Error('At least one recurrence weekday is required');
    }
    return daysOfWeek;
  }
}
