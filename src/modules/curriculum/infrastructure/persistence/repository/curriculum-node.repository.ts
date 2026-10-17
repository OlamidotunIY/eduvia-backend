import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  CurriculumNode,
  CurriculumNodeId,
  CurriculumProfileId,
  ICurriculumNodeRepository,
} from '../../../domain';
import { CurriculumNodeMapper } from '../mappers';

@Injectable()
export class PrismaCurriculumNodeRepository implements ICurriculumNodeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: CurriculumNodeMapper,
  ) {}

  public async findById(id: CurriculumNodeId | string): Promise<CurriculumNode | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.curriculumNode.findUnique({
      where: { id: rawId },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<CurriculumNode[]> {
    const records = await this.prisma.curriculumNode.findMany({
      orderBy: { depth: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByCurriculumId(
    curriculumId: CurriculumProfileId,
    depth?: number,
  ): Promise<CurriculumNode[]> {
    const where: any = { curriculumId: curriculumId.unpack() };
    if (depth !== undefined) {
      where.depth = depth;
    }
    const records = await this.prisma.curriculumNode.findMany({
      where,
      orderBy: [{ depth: 'asc' }, { name: 'asc' }],
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByParentId(parentId: CurriculumNodeId): Promise<CurriculumNode[]> {
    const records = await this.prisma.curriculumNode.findMany({
      where: { parentNodeId: parentId.unpack() },
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findSubtreeByPath(pathPrefix: string): Promise<CurriculumNode[]> {
    const records = await this.prisma.curriculumNode.findMany({
      where: {
        path: {
          startsWith: pathPrefix,
        },
      },
      orderBy: [{ depth: 'asc' }, { name: 'asc' }],
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findLeafNodes(curriculumId: CurriculumProfileId): Promise<CurriculumNode[]> {
    const records = await this.prisma.curriculumNode.findMany({
      where: {
        curriculumId: curriculumId.unpack(),
        isLeaf: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async search(
    query: string,
    curriculumId?: CurriculumProfileId,
  ): Promise<CurriculumNode[]> {
    const trimmed = query.trim();
    const where: any = {
      isActive: true,
      OR: [
        { name: { contains: trimmed } },
        { code: { contains: trimmed } },
      ],
    };
    if (curriculumId) {
      where.curriculumId = curriculumId.unpack();
    }
    const records = await this.prisma.curriculumNode.findMany({
      where,
      orderBy: [{ depth: 'asc' }, { name: 'asc' }],
      take: 50,
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findRootNodes(curriculumId: CurriculumProfileId): Promise<CurriculumNode[]> {
    const records = await this.prisma.curriculumNode.findMany({
      where: {
        curriculumId: curriculumId.unpack(),
        parentNodeId: null,
      },
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async save(entity: CurriculumNode): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    const id = entity.id.unpack();

    await this.prisma.curriculumNode.upsert({
      where: { id },
      create: {
        id,
        ...data,
      },
      update: data,
    });
  }

  public async delete(id: CurriculumNodeId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.curriculumNode.delete({
      where: { id: rawId },
    });
  }
}
