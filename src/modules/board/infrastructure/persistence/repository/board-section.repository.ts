import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  BoardSection,
  BoardSectionId,
  IBoardSectionRepository,
} from '../../../domain';
import { BoardSectionMapper } from '../mappers/board-section.mapper';

@Injectable()
export class PrismaBoardSectionRepository implements IBoardSectionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: BoardSectionMapper,
  ) {}

  public async findById(id: BoardSectionId | string): Promise<BoardSection | null> {
    const record = await this.prisma.boardSection.findUnique({
      where: { id: String(id) },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<BoardSection[]> {
    const records = await this.prisma.boardSection.findMany();
    return records.map((r) => this.mapper.toDomain(r));
  }

  public async findByBoardId(boardId: string): Promise<BoardSection[]> {
    const records = await this.prisma.boardSection.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
    });
    return records.map((r) => this.mapper.toDomain(r));
  }

  public async save(entity: BoardSection): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    await this.prisma.boardSection.upsert({
      where: { id: entity.id.unpack() },
      create: {
        id: entity.id.unpack(),
        ...data,
      },
      update: data,
    });
  }

  public async delete(id: BoardSectionId | string): Promise<void> {
    await this.prisma.boardSection.delete({
      where: { id: String(id) },
    });
  }

  public async deleteByBoardId(boardId: string): Promise<void> {
    await this.prisma.boardSection.deleteMany({
      where: { boardId },
    });
  }
}
