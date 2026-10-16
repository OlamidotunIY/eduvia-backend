import { BoardQuestionId, QuestionMode } from '../value-objects';
import { StudentResponse } from './student-response.entity';
import { DuplicateStudentResponseError } from '../errors';

export interface BoardQuestionProps {
  id: BoardQuestionId;
  boardId: string;
  questionId: string;
  position: number;
  mode: QuestionMode;
  assignedAt: Date;
  dueAt?: Date | null;
  showOptions: boolean;
  maxMarks: number;
  responses?: StudentResponse[];
}

export class BoardQuestion {
  public readonly id: BoardQuestionId;
  private _boardId: string;
  private _questionId: string;
  private _position: number;
  private _mode: QuestionMode;
  private _assignedAt: Date;
  private _dueAt?: Date | null;
  private _showOptions: boolean;
  private _maxMarks: number;
  private _responses: StudentResponse[];

  private constructor(props: BoardQuestionProps) {
    this.id = props.id;
    this._boardId = props.boardId;
    this._questionId = props.questionId;
    this._position = props.position;
    this._mode = props.mode;
    this._assignedAt = new Date(props.assignedAt);
    this._dueAt = props.dueAt ? new Date(props.dueAt) : null;
    this._showOptions = props.showOptions;
    this._maxMarks = props.maxMarks;
    this._responses = props.responses ? [...props.responses] : [];
  }

  public static create(props: {
    id?: BoardQuestionId;
    boardId: string;
    questionId: string;
    position: number;
    mode: QuestionMode;
    dueAt?: Date | null;
    showOptions?: boolean;
    maxMarks: number;
  }): BoardQuestion {
    return new BoardQuestion({
      id: props.id ?? BoardQuestionId.create(),
      boardId: props.boardId,
      questionId: props.questionId,
      position: props.position,
      mode: props.mode,
      assignedAt: new Date(),
      dueAt: props.dueAt ?? null,
      showOptions: props.showOptions ?? true,
      maxMarks: props.maxMarks,
      responses: [],
    });
  }

  public static reconstitute(props: BoardQuestionProps): BoardQuestion {
    return new BoardQuestion(props);
  }

  public get boardId(): string {
    return this._boardId;
  }

  public get questionId(): string {
    return this._questionId;
  }

  public get position(): number {
    return this._position;
  }

  public get mode(): QuestionMode {
    return this._mode;
  }

  public get assignedAt(): Date {
    return new Date(this._assignedAt);
  }

  public get dueAt(): Date | null | undefined {
    return this._dueAt ? new Date(this._dueAt) : null;
  }

  public get showOptions(): boolean {
    return this._showOptions;
  }

  public get maxMarks(): number {
    return this._maxMarks;
  }

  public get responses(): StudentResponse[] {
    return [...this._responses];
  }

  public updateSettings(props: {
    position?: number;
    showOptions?: boolean;
    dueAt?: Date | null;
  }): void {
    if (props.position !== undefined) this._position = props.position;
    if (props.showOptions !== undefined) this._showOptions = props.showOptions;
    if (props.dueAt !== undefined) this._dueAt = props.dueAt ? new Date(props.dueAt) : null;
  }

  public addResponse(response: StudentResponse): void {
    const existing = this._responses.find((r) => r.studentId === response.studentId);
    if (existing) {
      throw new DuplicateStudentResponseError({
        boardQuestionId: this.id.unpack(),
        studentId: response.studentId,
      });
    }
    this._responses.push(response);
  }

  public findResponseByStudent(studentId: string): StudentResponse | undefined {
    return this._responses.find((r) => r.studentId === studentId);
  }
}
