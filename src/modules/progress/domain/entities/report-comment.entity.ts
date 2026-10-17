import { ReportCommentId, CommentAuthorRole } from '../value-objects';
import { UnauthorizedCommentAuthorError } from '../errors';

export interface ReportCommentProps {
  id: ReportCommentId;
  reportId: string;
  authorId: string;
  authorRole: CommentAuthorRole;
  content: string;
  parentCommentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ReportComment {
  public readonly id: ReportCommentId;
  private _reportId: string;
  private _authorId: string;
  private _authorRole: CommentAuthorRole;
  private _content: string;
  private _parentCommentId: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ReportCommentProps) {
    if (
      props.authorRole !== CommentAuthorRole.parent &&
      props.authorRole !== CommentAuthorRole.admin
    ) {
      throw new UnauthorizedCommentAuthorError(props.authorRole);
    }
    if (!props.content || props.content.trim().length === 0) {
      throw new Error('Comment content cannot be empty.');
    }

    this.id = props.id;
    this._reportId = props.reportId;
    this._authorId = props.authorId;
    this._authorRole = props.authorRole;
    this._content = props.content;
    this._parentCommentId = props.parentCommentId ?? null;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(props: {
    id?: ReportCommentId;
    reportId: string;
    authorId: string;
    authorRole: CommentAuthorRole;
    content: string;
    parentCommentId?: string | null;
  }): ReportComment {
    const now = new Date();
    return new ReportComment({
      id: props.id ?? ReportCommentId.create(),
      reportId: props.reportId,
      authorId: props.authorId,
      authorRole: props.authorRole,
      content: props.content.trim(),
      parentCommentId: props.parentCommentId ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: ReportCommentProps): ReportComment {
    return new ReportComment(props);
  }

  public get reportId(): string {
    return this._reportId;
  }

  public get authorId(): string {
    return this._authorId;
  }

  public get authorRole(): CommentAuthorRole {
    return this._authorRole;
  }

  public get content(): string {
    return this._content;
  }

  public get parentCommentId(): string | null {
    return this._parentCommentId;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
}
