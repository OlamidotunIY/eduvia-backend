import { CommentAuthorRole } from '../../../domain';

export interface AddReportCommentPayload {
  reportId: string;
  authorId: string;
  authorRole: CommentAuthorRole;
  content: string;
  parentCommentId?: string | null;
  correlationId?: string;
}

export class AddReportCommentCommand {
  constructor(public readonly payload: AddReportCommentPayload) {}
}
