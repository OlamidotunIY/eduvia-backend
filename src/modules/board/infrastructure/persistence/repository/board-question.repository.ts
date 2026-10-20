import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  BoardQuestion,
  BoardQuestionId,
  IBoardQuestionRepository,
} from '../../../domain';
import { BoardQuestionMapper } from '../mappers/board-question.mapper';
import { StudentResponseMapper } from '../mappers/student-response.mapper';

@Injectable()
export class PrismaBoardQuestionRepository implements IBoardQuestionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: BoardQuestionMapper,
    private readonly responseMapper: StudentResponseMapper,
  ) {}

  public async findById(id: BoardQuestionId | string): Promise<BoardQuestion | null> {
    const record = await this.prisma.boardQuestion.findUnique({
      where: { id: String(id) },
      include: { responses: true },
    });
    if (!record) return null;
    const question = this.mapper.toDomain(record);
    if (record.responses) {
      for (const resp of record.responses) {
        question.addResponse(this.responseMapper.toDomain(resp));
      }
    }
    return question;
  }

  public async findAll(): Promise<BoardQuestion[]> {
    const records = await this.prisma.boardQuestion.findMany({
      include: { responses: true },
    });
    return records.map((record) => {
      const question = this.mapper.toDomain(record);
      if (record.responses) {
        for (const resp of record.responses) {
          question.addResponse(this.responseMapper.toDomain(resp));
        }
      }
      return question;
    });
  }

  public async findByBoardId(boardId: string): Promise<BoardQuestion[]> {
    const records = await this.prisma.boardQuestion.findMany({
      where: { boardId },
      include: { responses: true },
      orderBy: { position: 'asc' },
    });
    return records.map((record) => {
      const question = this.mapper.toDomain(record);
      if (record.responses) {
        for (const resp of record.responses) {
          question.addResponse(this.responseMapper.toDomain(resp));
        }
      }
      return question;
    });
  }

  public async findByBoardAndQuestion(
    boardId: string,
    questionId: string,
  ): Promise<BoardQuestion | null> {
    const record = await this.prisma.boardQuestion.findFirst({
      where: { boardId, questionId },
      include: { responses: true },
    });
    if (!record) return null;
    const question = this.mapper.toDomain(record);
    if (record.responses) {
      for (const resp of record.responses) {
        question.addResponse(this.responseMapper.toDomain(resp));
      }
    }
    return question;
  }

  public async save(entity: BoardQuestion): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    await this.prisma.boardQuestion.upsert({
      where: { id: entity.id.unpack() },
      create: {
        id: entity.id.unpack(),
        ...data,
      },
      update: data,
    });
  }

  public async delete(id: BoardQuestionId | string): Promise<void> {
    await this.prisma.boardQuestion.delete({
      where: { id: String(id) },
    });
  }
}
