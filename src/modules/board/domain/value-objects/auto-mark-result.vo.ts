export interface AutoMarkResultProps {
  isCorrect: boolean;
  marksAwarded: number;
  markedAt: Date;
}

export class AutoMarkResult {
  private readonly _isCorrect: boolean;
  private readonly _marksAwarded: number;
  private readonly _markedAt: Date;

  private constructor(props: AutoMarkResultProps) {
    if (props.marksAwarded < 0) {
      throw new Error('Marks awarded cannot be negative.');
    }
    this._isCorrect = props.isCorrect;
    this._marksAwarded = props.marksAwarded;
    this._markedAt = new Date(props.markedAt);
  }

  public static create(isCorrect: boolean, marksAwarded: number, markedAt: Date = new Date()): AutoMarkResult {
    return new AutoMarkResult({ isCorrect, marksAwarded, markedAt });
  }

  public get isCorrect(): boolean {
    return this._isCorrect;
  }

  public get marksAwarded(): number {
    return this._marksAwarded;
  }

  public get markedAt(): Date {
    return new Date(this._markedAt);
  }

  public equals(other: AutoMarkResult): boolean {
    if (!other) return false;
    return (
      this._isCorrect === other._isCorrect &&
      this._marksAwarded === other._marksAwarded &&
      this._markedAt.getTime() === other._markedAt.getTime()
    );
  }

  public toJSON(): AutoMarkResultProps {
    return {
      isCorrect: this._isCorrect,
      marksAwarded: this._marksAwarded,
      markedAt: this._markedAt,
    };
  }
}
