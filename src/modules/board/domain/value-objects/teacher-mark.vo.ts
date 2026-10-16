export interface TeacherMarkProps {
  marksAwarded: number;
  maxMarks: number;
  feedback?: string | null;
  markedBy: string;
  markedAt: Date;
}

export class TeacherMark {
  private readonly _marksAwarded: number;
  private readonly _maxMarks: number;
  private readonly _feedback?: string | null;
  private readonly _markedBy: string;
  private readonly _markedAt: Date;

  private constructor(props: TeacherMarkProps) {
    if (props.marksAwarded < 0) {
      throw new Error('Marks awarded cannot be negative.');
    }
    if (props.maxMarks < 0) {
      throw new Error('Max marks cannot be negative.');
    }
    if (props.marksAwarded > props.maxMarks) {
      throw new Error(`Marks awarded (${props.marksAwarded}) cannot exceed max marks (${props.maxMarks}).`);
    }
    if (!props.markedBy) {
      throw new Error('Teacher userId (markedBy) is required.');
    }

    this._marksAwarded = props.marksAwarded;
    this._maxMarks = props.maxMarks;
    this._feedback = props.feedback ?? null;
    this._markedBy = props.markedBy;
    this._markedAt = new Date(props.markedAt);
  }

  public static create(
    marksAwarded: number,
    maxMarks: number,
    markedBy: string,
    feedback?: string | null,
    markedAt: Date = new Date(),
  ): TeacherMark {
    return new TeacherMark({
      marksAwarded,
      maxMarks,
      markedBy,
      feedback,
      markedAt,
    });
  }

  public get marksAwarded(): number {
    return this._marksAwarded;
  }

  public get maxMarks(): number {
    return this._maxMarks;
  }

  public get feedback(): string | null | undefined {
    return this._feedback;
  }

  public get markedBy(): string {
    return this._markedBy;
  }

  public get markedAt(): Date {
    return new Date(this._markedAt);
  }

  public equals(other: TeacherMark): boolean {
    if (!other) return false;
    return (
      this._marksAwarded === other._marksAwarded &&
      this._maxMarks === other._maxMarks &&
      this._feedback === other._feedback &&
      this._markedBy === other._markedBy &&
      this._markedAt.getTime() === other._markedAt.getTime()
    );
  }

  public toJSON(): TeacherMarkProps {
    return {
      marksAwarded: this._marksAwarded,
      maxMarks: this._maxMarks,
      feedback: this._feedback,
      markedBy: this._markedBy,
      markedAt: this._markedAt,
    };
  }
}
