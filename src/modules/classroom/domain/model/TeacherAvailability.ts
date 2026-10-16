import { AggregateRoot } from '@modules/shared';
import { TeacherAvailabilityId } from '../value-objects/teacher-availability-id.vo';
import { AvailabilitySlot } from '../entities/availability-slot.entity';
import { AvailabilityException } from '../entities/availability-exception.entity';
import { AvailabilitySlotId } from '../value-objects/availability-slot-id.vo';
import { AvailabilityExceptionId } from '../value-objects/availability-exception-id.vo';
import { ExceptionType } from '../value-objects/exception-type.vo';
import { ClassroomInvariantError } from '../errors/classroom-invariant.error';

export interface TeacherAvailabilityCreateProps {
  id?: TeacherAvailabilityId;
  orgId: string;
  teacherId: string;
  slots?: AvailabilitySlot[];
  exceptions?: AvailabilityException[];
}

export interface TeacherAvailabilityReconstituteProps {
  id: TeacherAvailabilityId;
  orgId: string;
  teacherId: string;
  slots: AvailabilitySlot[];
  exceptions: AvailabilityException[];
  createdAt: Date;
  updatedAt: Date;
}

export class TeacherAvailability extends AggregateRoot<TeacherAvailabilityId> {
  public readonly orgId: string;
  public readonly teacherId: string;
  private _slots: AvailabilitySlot[];
  private _exceptions: AvailabilityException[];
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: TeacherAvailabilityReconstituteProps) {
    super(props.id);
    this.orgId = props.orgId;
    this.teacherId = props.teacherId;
    this._slots = [...props.slots];
    this._exceptions = [...props.exceptions];
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: TeacherAvailabilityCreateProps): TeacherAvailability {
    if (!props.orgId) throw new ClassroomInvariantError('Org ID is required');
    if (!props.teacherId) throw new ClassroomInvariantError('Teacher ID is required');

    const id = props.id ?? TeacherAvailabilityId.create();
    const now = new Date();
    return new TeacherAvailability({
      id,
      orgId: props.orgId,
      teacherId: props.teacherId,
      slots: props.slots ?? [],
      exceptions: props.exceptions ?? [],
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: TeacherAvailabilityReconstituteProps): TeacherAvailability {
    return new TeacherAvailability(props);
  }

  public setSlots(slots: AvailabilitySlot[]): void {
    this._slots = [...slots];
    this.touch();
  }

  public addSlot(slot: AvailabilitySlot): void {
    this._slots.push(slot);
    this.touch();
  }

  public removeSlot(slotId: AvailabilitySlotId): void {
    this._slots = this._slots.filter((s) => !s.id.equals(slotId));
    this.touch();
  }

  public addException(exception: AvailabilityException): void {
    this._exceptions.push(exception);
    this.touch();
  }

  public removeException(exceptionId: AvailabilityExceptionId): void {
    this._exceptions = this._exceptions.filter((e) => !e.id.equals(exceptionId));
    this.touch();
  }

  public isAvailableAt(datetime: Date, durationMins: number): boolean {
    const targetDateStr = datetime.toISOString().slice(0, 10);
    const dayExceptions = this._exceptions.filter(
      (e) => e.date.toISOString().slice(0, 10) === targetDateStr,
    );

    // If whole day or slot is blocked
    const isBlocked = dayExceptions.some(
      (e) =>
        e.type === ExceptionType.BLOCKED &&
        (!e.startTime || this.isTimeOverlapping(datetime, durationMins, e.startTime, e.endTime ?? '23:59')),
    );
    if (isBlocked) {
      return false;
    }

    // Check if specifically added as an exception slot
    const hasAddedException = dayExceptions.some(
      (e) =>
        e.type === ExceptionType.ADDED &&
        e.startTime &&
        e.endTime &&
        this.isTimeCovered(datetime, durationMins, e.startTime, e.endTime),
    );
    if (hasAddedException) {
      return true;
    }

    // Check recurring slots
    const dayOfWeek = datetime.getDay();
    const daySlots = this._slots.filter((s) => s.dayOfWeek === dayOfWeek);

    return daySlots.some((slot) =>
      this.isTimeCovered(datetime, durationMins, slot.startTime, slot.endTime),
    );
  }

  public getAvailableSlots(startDate: Date, endDate: Date, durationMins: number): Date[] {
    const availableSlots: Date[] = [];
    const current = new Date(startDate);
    current.setSeconds(0, 0);

    while (current <= endDate) {
      if (this.isAvailableAt(current, durationMins)) {
        availableSlots.push(new Date(current));
      }
      // Step by 30-minute intervals
      current.setMinutes(current.getMinutes() + 30);
    }

    return availableSlots;
  }

  private isTimeCovered(datetime: Date, durationMins: number, startTime: string, endTime: string): boolean {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const slotStartMins = startH * 60 + startM;
    const slotEndMins = endH * 60 + endM;

    const requestStartMins = datetime.getHours() * 60 + datetime.getMinutes();
    const requestEndMins = requestStartMins + durationMins;

    return requestStartMins >= slotStartMins && requestEndMins <= slotEndMins;
  }

  private isTimeOverlapping(datetime: Date, durationMins: number, startTime: string, endTime: string): boolean {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const blockStartMins = startH * 60 + startM;
    const blockEndMins = endH * 60 + endM;

    const reqStartMins = datetime.getHours() * 60 + datetime.getMinutes();
    const reqEndMins = reqStartMins + durationMins;

    return reqStartMins < blockEndMins && reqEndMins > blockStartMins;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // Getters
  public get slots(): AvailabilitySlot[] {
    return [...this._slots];
  }

  public get exceptions(): AvailabilityException[] {
    return [...this._exceptions];
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
