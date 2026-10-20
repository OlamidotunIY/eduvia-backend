import { MasteryHistoryEntryId, MasteryTrigger } from '../value-objects';

export interface MasteryHistoryEntryProps {
  id: MasteryHistoryEntryId;
  masteryRecordId: string;
  masteryLevel: number;
  trigger: MasteryTrigger;
  lessonId?: string | null;
  recordedAt: Date;
}

export class MasteryHistoryEntry {
  public readonly id: MasteryHistoryEntryId;
  private _masteryRecordId: string;
  private _masteryLevel: number;
  private _trigger: MasteryTrigger;
  private _lessonId: string | null;
  private _recordedAt: Date;

  private constructor(props: MasteryHistoryEntryProps) {
    this.id = props.id;
    this._masteryRecordId = props.masteryRecordId;
    this._masteryLevel = Math.min(1.0, Math.max(0.0, props.masteryLevel));
    this._trigger = props.trigger;
    this._lessonId = props.lessonId ?? null;
    this._recordedAt = new Date(props.recordedAt);
  }

  public static create(props: {
    id?: MasteryHistoryEntryId;
    masteryRecordId: string;
    masteryLevel: number;
    trigger: MasteryTrigger;
    lessonId?: string | null;
    recordedAt?: Date;
  }): MasteryHistoryEntry {
    return new MasteryHistoryEntry({
      id: props.id ?? MasteryHistoryEntryId.create(),
      masteryRecordId: props.masteryRecordId,
      masteryLevel: props.masteryLevel,
      trigger: props.trigger,
      lessonId: props.lessonId ?? null,
      recordedAt: props.recordedAt ?? new Date(),
    });
  }

  public static reconstitute(props: MasteryHistoryEntryProps): MasteryHistoryEntry {
    return new MasteryHistoryEntry(props);
  }

  public get masteryRecordId(): string {
    return this._masteryRecordId;
  }

  public get masteryLevel(): number {
    return this._masteryLevel;
  }

  public get trigger(): MasteryTrigger {
    return this._trigger;
  }

  public get lessonId(): string | null {
    return this._lessonId;
  }

  public get recordedAt(): Date {
    return new Date(this._recordedAt);
  }
}
