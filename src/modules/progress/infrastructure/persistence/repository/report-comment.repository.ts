import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  ReportComment,
  ReportCommentId,
  IReportCommentRepository,
} from '../../../domain';
import { ReportCommentMapper } from '../mappers/report-comment.mapper';

@Injectable()
export class PrismaReportCommentRepository implements IReportCommentRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: ReportCommentMapper,
  ) {}

  public async findById(id: ReportCommentId | string): Promise<ReportComment | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.reportComment.findUnique({
      where: { id: rawId },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<ReportComment[]> {
    const records = await this.prisma.reportComment.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async save(entity: ReportComment): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    const commentId = entity.id.unpack();

    await this.prisma.reportComment.upsert({
      where: { id: commentId },
      create: {
        id: commentId,
        ...data,
      },
      update: data,
    });
  }

  public async delete(id: ReportCommentId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.reportComment.delete({
      where: { id: rawId },
    });
  }

  public async findByReportId(reportId: string): Promise<ReportComment[]> {
    const records = await this.prisma.reportComment.findMany({
      where: { reportId },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }
}
