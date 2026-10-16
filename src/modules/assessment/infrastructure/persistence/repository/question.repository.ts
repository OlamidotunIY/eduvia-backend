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
        },
        update: data,
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
    const where: any = {
      OR: [
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
      ],
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
