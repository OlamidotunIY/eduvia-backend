import {
  StudentResponseId,
  ResponseType,
  AutoMarkResult,
  TeacherMark,
} from '../value-objects';

export interface StudentResponseProps {
  id: StudentResponseId;
  boardQuestionId: string;
  studentId: string;
  responseType: ResponseType;
  textContent?: string | null;
  imageUrl?: string | null;
  selectedOption?: string | null;
  submittedAt: Date;
  autoMarkResult?: AutoMarkResult | null;
  teacherMark?: TeacherMark | null;
}

export class StudentResponse {
  public readonly id: StudentResponseId;
  private _boardQuestionId: string;
  private _studentId: string;
  private _responseType: ResponseType;
  private _textContent?: string | null;
  private _imageUrl?: string | null;
  private _selectedOption?: string | null;
  private _submittedAt: Date;
  private _autoMarkResult?: AutoMarkResult | null;
  private _teacherMark?: TeacherMark | null;

  private constructor(props: StudentResponseProps) {
    this.id = props.id;
    this._boardQuestionId = props.boardQuestionId;
    this._studentId = props.studentId;
    this._responseType = props.responseType;
    this._textContent = props.textContent ?? null;
    this._imageUrl = props.imageUrl ?? null;
    this._selectedOption = props.selectedOption ?? null;
    this._submittedAt = new Date(props.submittedAt);
    this._autoMarkResult = props.autoMarkResult ?? null;
    this._teacherMark = props.teacherMark ?? null;
  }

  public static create(props: {
    id?: StudentResponseId;
    boardQuestionId: string;
    studentId: string;
    responseType: ResponseType;
    textContent?: string | null;
    imageUrl?: string | null;
    selectedOption?: string | null;
    autoMarkResult?: AutoMarkResult | null;
    teacherMark?: TeacherMark | null;
  }): StudentResponse {
    return new StudentResponse({
      id: props.id ?? StudentResponseId.create(),
      boardQuestionId: props.boardQuestionId,
      studentId: props.studentId,
      responseType: props.responseType,
      textContent: props.textContent ?? null,
      imageUrl: props.imageUrl ?? null,
      selectedOption: props.selectedOption ?? null,
      submittedAt: new Date(),
      autoMarkResult: props.autoMarkResult ?? null,
      teacherMark: props.teacherMark ?? null,
    });
  }

  public static reconstitute(props: StudentResponseProps): StudentResponse {
    return new StudentResponse(props);
  }

  public get boardQuestionId(): string {
    return this._boardQuestionId;
  }

  public get studentId(): string {
    return this._studentId;
  }

  public get responseType(): ResponseType {
    return this._responseType;
  }

  public get textContent(): string | null | undefined {
    return this._textContent;
  }

  public get imageUrl(): string | null | undefined {
    return this._imageUrl;
  }

  public get selectedOption(): string | null | undefined {
    return this._selectedOption;
  }

  public get submittedAt(): Date {
    return new Date(this._submittedAt);
  }

  public get autoMarkResult(): AutoMarkResult | null | undefined {
    return this._autoMarkResult;
  }

  public get teacherMark(): TeacherMark | null | undefined {
    return this._teacherMark;
  }

  public setAutoMarkResult(result: AutoMarkResult): void {
    this._autoMarkResult = result;
  }

  public setTeacherMark(mark: TeacherMark): void {
    this._teacherMark = mark;
  }
}
