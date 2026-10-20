import { BoardSectionId, SectionType } from '../value-objects';

export interface BoardSectionProps {
  id: BoardSectionId;
  boardId: string;
  type: SectionType;
  content: string;
  position: number;
  createdBy: string;
  isTeacherOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class BoardSection {
  public readonly id: BoardSectionId;
  private _boardId: string;
  private _type: SectionType;
  private _content: string;
  private _position: number;
  private _createdBy: string;
  private _isTeacherOnly: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: BoardSectionProps) {
    this.id = props.id;
    this._boardId = props.boardId;
    this._type = props.type;
    this._content = props.content;
    this._position = props.position;
    this._createdBy = props.createdBy;
    this._isTeacherOnly = props.isTeacherOnly;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(props: {
    id?: BoardSectionId;
    boardId: string;
    type: SectionType;
    content: string;
    position: number;
    createdBy: string;
    isTeacherOnly?: boolean;
  }): BoardSection {
    const now = new Date();
    return new BoardSection({
      id: props.id ?? BoardSectionId.create(),
      boardId: props.boardId,
      type: props.type,
      content: props.content,
      position: props.position,
      createdBy: props.createdBy,
      isTeacherOnly: props.isTeacherOnly ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: BoardSectionProps): BoardSection {
    return new BoardSection(props);
  }

  public get boardId(): string {
    return this._boardId;
  }

  public get type(): SectionType {
    return this._type;
  }

  public get content(): string {
    return this._content;
  }

  public get position(): number {
    return this._position;
  }

  public get createdBy(): string {
    return this._createdBy;
  }

  public get isTeacherOnly(): boolean {
    return this._isTeacherOnly;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  public updateContent(content: string): void {
    this._content = content;
    this._updatedAt = new Date();
  }

  public updatePosition(position: number): void {
    this._position = position;
    this._updatedAt = new Date();
  }

  public updateTeacherOnly(isTeacherOnly: boolean): void {
    this._isTeacherOnly = isTeacherOnly;
    this._updatedAt = new Date();
  }
}
