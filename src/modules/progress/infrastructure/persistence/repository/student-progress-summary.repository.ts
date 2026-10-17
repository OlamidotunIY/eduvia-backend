import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  StudentProgressSummary,
  StudentProgressSummaryId,
  IStudentProgressSummaryRepository,
} from '../../../domain';
import { StudentProgressSummaryMapper } from '../mappers/student-progress-summary.mapper';

@Injectable()
export class PrismaStudentProgressSummaryRepository
  implements IStudentProgressSummaryRepository
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: StudentProgressSummaryMapper,
  ) {}

  public async findById(
    id: StudentProgressSummaryId | string,
  ): Promise<StudentProgressSummary | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.studentProgressSummary.findUnique({
      where: { id: rawId },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<StudentProgressSummary[]> {
    const records = await this.prisma.studentProgressSummary.findMany();
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByStudentAndSubject(
    studentId: string,
    orgId: string,
    subjectId: string,
  ): Promise<StudentProgressSummary | null> {
    const record = await this.prisma.studentProgressSummary.findUnique({
      where: {
        studentId_orgId_subjectId: {
          studentId,
          orgId,
          subjectId,
        },
      },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAllByStudent(
    studentId: string,
    orgId?: string,
  ): Promise<StudentProgressSummary[]> {
    const where: any = { studentId };
    if (orgId) {
      where.orgId = orgId;
    }
    const records = await this.prisma.studentProgressSummary.findMany({
      where,
      orderBy: { lastUpdatedAt: 'desc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByOrg(orgId: string): Promise<StudentProgressSummary[]> {
    const records = await this.prisma.studentProgressSummary.findMany({
      where: { orgId },
      orderBy: { lastUpdatedAt: 'desc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async save(entity: StudentProgressSummary): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    const summaryId = entity.id.unpack();

    await this.prisma.studentProgressSummary.upsert({
      where: { id: summaryId },
      create: {
        id: summaryId,
        ...data,
      },
      update: data,
    });
  }

  public async delete(id: StudentProgressSummaryId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.studentProgressSummary.delete({
      where: { id: rawId },
    });
  }
}
