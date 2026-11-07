import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  Question,
  QuestionId,
  IQuestionRepository,
  QuestionFilter,
  QuestionOwnerType,
} from '../../../domain';
import { QuestionMapper } from '../mappers/question.mapper';
import { QuestionOptionMapper } from '../mappers/question-option.mapper';

@Injectable()
export class PrismaQuestionRepository implements IQuestionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: QuestionMapper,
    private readonly optionMapper: QuestionOptionMapper,
  ) {}

  public async findById(id: QuestionId | string): Promise<Question | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.question.findUnique({
      where: { id: rawId },
      include: { options: true },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<Question[]> {
    const records = await this.prisma.question.findMany({
      include: { options: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async save(entity: Question): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    const questionId = entity.id.unpack();

    await this.prisma.$transaction(async (tx) => {
      await tx.question.upsert({
        where: { id: questionId },
        create: {
          id: questionId,
          ...data,
        } as any,
        update: data as any,
      });

      await tx.questionOption.deleteMany({
        where: { questionId },
      });

      if (entity.options.length > 0) {
        await tx.questionOption.createMany({
          data: entity.options.map((opt) => ({
            id: opt.id.unpack(),
            ...this.optionMapper.toPersistence(opt),
          })),
        });
      }
    });
  }

  public async delete(id: QuestionId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.question.delete({
      where: { id: rawId },
    });
  }

  public async findForOrg(
    orgId: string,
    currentTeacherId?: string,
    filter?: QuestionFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<Question[]> {
    const where: any = this.buildOrgScopeWhere(orgId, currentTeacherId, filter);
    this.applyCommonFilters(where, filter);

    const records = await this.prisma.question.findMany({
      where,
      include: { options: true },
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.mapper.toDomain(record));
  }

  public async countForOrg(
    orgId: string,
    currentTeacherId?: string,
    filter?: QuestionFilter,
  ): Promise<number> {
    const where: any = this.buildOrgScopeWhere(orgId, currentTeacherId, filter);
    this.applyCommonFilters(where, filter);
    return this.prisma.question.count({ where });
  }

  public async getSummaryForOrg(
    orgId: string,
    currentTeacherId?: string,
  ): Promise<{
    totalAccessible: number;
    platformQuestions: number;
    orgQuestions: number;
    publishedOrgQuestions: number;
  }> {
    const [platformCount, orgCount, publishedOrgCount, teacherCount] = await Promise.all([
      this.prisma.question.count({
        where: { ownerType: QuestionOwnerType.platform },
      }),
      this.prisma.question.count({
        where: { ownerType: QuestionOwnerType.org, orgId },
      }),
      this.prisma.question.count({
        where: { ownerType: QuestionOwnerType.org, orgId, isPublished: true },
      }),
      currentTeacherId
        ? this.prisma.question.count({
            where: { ownerType: QuestionOwnerType.teacher, orgId, ownerId: currentTeacherId },
          })
        : this.prisma.question.count({
            where: { ownerType: QuestionOwnerType.teacher, orgId },
          }),
    ]);

    return {
      totalAccessible: platformCount + orgCount + teacherCount,
      platformQuestions: platformCount,
      orgQuestions: orgCount + teacherCount,
      publishedOrgQuestions: publishedOrgCount,
    };
  }

  private buildOrgScopeWhere(
    orgId: string,
    currentTeacherId?: string,
    filter?: QuestionFilter,
  ): any {
    const where: any = {};

    if (filter?.ownerType === QuestionOwnerType.platform) {
      where.ownerType = QuestionOwnerType.platform;
    } else if (filter?.ownerType === QuestionOwnerType.org) {
      where.ownerType = QuestionOwnerType.org;
      where.orgId = orgId;
    } else if (filter?.ownerType === QuestionOwnerType.teacher) {
      where.ownerType = QuestionOwnerType.teacher;
      where.orgId = orgId;
      if (currentTeacherId) {
        where.ownerId = currentTeacherId;
      }
    } else {
      where.OR = [
        { ownerType: QuestionOwnerType.platform },
        { ownerType: QuestionOwnerType.org, orgId },
        ...(currentTeacherId
          ? [
              {
                ownerType: QuestionOwnerType.teacher,
                orgId,
                ownerId: currentTeacherId,
              },
            ]
          : [{ ownerType: QuestionOwnerType.teacher, orgId }]),
      ];
    }

    return where;
  }

  public async findPlatformQuestions(
    filter?: QuestionFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<Question[]> {
    const where: any = {
      ownerType: QuestionOwnerType.platform,
    };

    this.applyCommonFilters(where, filter);

    const records = await this.prisma.question.findMany({
      where,
      include: { options: true },
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.mapper.toDomain(record));
  }

  public async search(
    filter: QuestionFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<Question[]> {
    const where: any = {};
    this.applyCommonFilters(where, filter);

    if (filter.ownerType) {
      where.ownerType = filter.ownerType;
    }
    if (filter.ownerId) {
      where.ownerId = filter.ownerId;
    }
    if (filter.orgId) {
      where.orgId = filter.orgId;
    }

    const records = await this.prisma.question.findMany({
      where,
      include: { options: true },
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.mapper.toDomain(record));
  }

  private applyCommonFilters(where: any, filter?: QuestionFilter): void {
    if (!filter) return;

    if (filter.subject) {
      where.subject = { contains: filter.subject };
    }
    if (filter.curriculumNodeId) {
      where.curriculumNodeId = filter.curriculumNodeId;
    }
    if (filter.difficultyLevel) {
      where.difficultyLevel = filter.difficultyLevel;
    }
    if (filter.type) {
      where.type = filter.type;
    }
    if (filter.isPublished !== undefined) {
      where.isPublished = filter.isPublished;
    }
    if (filter.search) {
      where.stem = { contains: filter.search };
    }
  }
}
