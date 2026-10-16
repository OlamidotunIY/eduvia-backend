import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  LearningBoard,
  LearningBoardId,
  ILearningBoardRepository,
} from '../../../domain';
import { LearningBoard as PrismaLearningBoard } from '@generated/prisma/client';
import { LearningBoardMapper } from '../mappers/learning-board.mapper';

@Injectable()
export class PrismaLearningBoardRepository
  extends PrismaBaseRepository<LearningBoardId, LearningBoard, PrismaLearningBoard>
  implements ILearningBoardRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly learningBoardMapper: LearningBoardMapper,
  ) {
    super(prisma, learningBoardMapper);
  }

  protected get delegate() {
    return this.prisma.learningBoard;
  }

  public async findByLessonId(lessonId: string): Promise<LearningBoard | null> {
    const record = await this.delegate.findUnique({
      where: { lessonId },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findByOrgId(
    orgId: string,
    pagination?: { skip?: number; take?: number },
  ): Promise<LearningBoard[]> {
    const records = await this.delegate.findMany({
      where: { orgId },
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }
}
