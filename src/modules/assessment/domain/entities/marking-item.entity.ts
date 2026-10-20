import { MarkingItemId, MarkingStatus, QuestionType } from '../value-objects';
import { InvalidMarkRangeError } from '../errors';

export interface MarkingItemProps {
  id: MarkingItemId;
  assessmentId: string;
  boardQuestionId: string;
  studentResponseId: string;
  questionType: QuestionType;
  maxMarks: number;
  autoMarked: boolean;
  marksAwarded?: number | null;
  feedback?: string | null;
  markedBy?: string | null;
  markedAt?: Date | null;
  status: MarkingStatus;
}

export class MarkingItem {
  public readonly id: MarkingItemId;
  private _assessmentId: string;
  private _boardQuestionId: string;
  private _studentResponseId: string;
  private _questionType: QuestionType;
  private _maxMarks: number;
  private _autoMarked: boolean;
  private _marksAwarded: number | null;
  private _feedback: string | null;
  private _markedBy: string | null;
  private _markedAt: Date | null;
  private _status: MarkingStatus;

  private constructor(props: MarkingItemProps) {
    if (props.maxMarks < 0) {
      throw new InvalidMarkRangeError('Max marks cannot be negative.');
    }
    this.id = props.id;
    this._assessmentId = props.assessmentId;
    this._boardQuestionId = props.boardQuestionId;
    this._studentResponseId = props.studentResponseId;
    this._questionType = props.questionType;
    this._maxMarks = props.maxMarks;
    this._autoMarked = props.autoMarked;
    this._marksAwarded = props.marksAwarded ?? null;
    this._feedback = props.feedback ?? null;
    this._markedBy = props.markedBy ?? null;
    this._markedAt = props.markedAt ? new Date(props.markedAt) : null;
    this._status = props.status;
  }

  public static create(props: {
    id?: MarkingItemId;
    assessmentId: string;
    boardQuestionId: string;
    studentResponseId: string;
    questionType: QuestionType;
    maxMarks: number;
    autoMarked?: boolean;
    marksAwarded?: number | null;
    feedback?: string | null;
    markedBy?: string | null;
    status?: MarkingStatus;
  }): MarkingItem {
    return new MarkingItem({
      id: props.id ?? MarkingItemId.create(),
      assessmentId: props.assessmentId,
      boardQuestionId: props.boardQuestionId,
      studentResponseId: props.studentResponseId,
      questionType: props.questionType,
      maxMarks: props.maxMarks,
      autoMarked: props.autoMarked ?? false,
      marksAwarded: props.marksAwarded ?? null,
      feedback: props.feedback ?? null,
      markedBy: props.markedBy ?? null,
      markedAt: props.marksAwarded !== undefined && props.marksAwarded !== null ? new Date() : null,
      status: props.status ?? MarkingStatus.pending,
    });
  }

  public static reconstitute(props: MarkingItemProps): MarkingItem {
    return new MarkingItem(props);
  }

  public get assessmentId(): string {
    return this._assessmentId;
  }

  public get boardQuestionId(): string {
    return this._boardQuestionId;
  }

  public get studentResponseId(): string {
    return this._studentResponseId;
  }

  public get questionType(): QuestionType {
    return this._questionType;
  }

  public get maxMarks(): number {
    return this._maxMarks;
  }

  public get autoMarked(): boolean {
    return this._autoMarked;
  }

  public get marksAwarded(): number | null {
    return this._marksAwarded;
  }

  public get feedback(): string | null {
    return this._feedback;
  }

  public get markedBy(): string | null {
    return this._markedBy;
  }

  public get markedAt(): Date | null {
    return this._markedAt ? new Date(this._markedAt) : null;
  }

  public get status(): MarkingStatus {
    return this._status;
  }

  public applyAutoMark(marks: number): void {
    if (marks < 0 || marks > this._maxMarks) {
      throw new InvalidMarkRangeError(
        `Marks awarded (${marks}) must be between 0 and ${this._maxMarks}.`,
      );
    }
    this._autoMarked = true;
    this._marksAwarded = marks;
    this._status = MarkingStatus.auto_marked;
    this._markedAt = new Date();
  }

  public applyTeacherMark(
    marks: number,
    teacherId: string,
    feedback?: string | null,
  ): void {
    if (marks < 0 || marks > this._maxMarks) {
      throw new InvalidMarkRangeError(
        `Marks awarded (${marks}) must be between 0 and ${this._maxMarks}.`,
      );
    }
    this._marksAwarded = marks;
    this._markedBy = teacherId;
    this._feedback = feedback ?? null;
    this._status = MarkingStatus.teacher_marked;
    this._markedAt = new Date();
  }
}
