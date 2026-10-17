import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { ReportComment, ReportCommentId, CommentAuthorRole } from '../../../domain';
import { ReportComment as PrismaReportComment } from '@generated/prisma/client';

@Injectable()
export class ReportCommentMapper implements IMapper<ReportComment, PrismaReportComment> {
  toDomain(record: PrismaReportComment): ReportComment {
    return ReportComment.reconstitute({
      id: ReportCommentId.from(record.id),
      reportId: record.reportId,
      authorId: record.authorId,
      authorRole: record.authorRole as CommentAuthorRole,
      content: record.content,
      parentCommentId: record.parentCommentId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: ReportComment): Omit<PrismaReportComment, 'id'> {
    return {
      reportId: entity.reportId,
      authorId: entity.authorId,
      authorRole: entity.authorRole as any,
      content: entity.content,
      parentCommentId: entity.parentCommentId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
