import { CommentAuthorRole } from '../../../domain';

export interface AddReportCommentResult {
  commentId: string;
  reportId: string;
  authorId: string;
  authorRole: CommentAuthorRole;
  content: string;
  parentCommentId: string | null;
  createdAt: Date;
}
