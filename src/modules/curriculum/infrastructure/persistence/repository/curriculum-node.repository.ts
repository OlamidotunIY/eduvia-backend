import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  CurriculumNode,
  CurriculumNodeId,
  CurriculumProfileId,
  ICurriculumNodeRepository,
} from '../../../domain';
import { CurriculumNode as PrismaCurriculumNode } from '@generated/prisma/client';
import { CurriculumNodeMapper } from '../mappers';

@Injectable()
export class PrismaCurriculumNodeRepository
  extends PrismaBaseRepository<CurriculumNodeId, CurriculumNode, PrismaCurriculumNode>
  implements ICurriculumNodeRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mapper: CurriculumNodeMapper,
  ) {
    super(prisma, mapper);
  }

  protected get delegate() {
    return this.prisma.curriculumNode;
  }

  public async findByCurriculumId(
    curriculumId: CurriculumProfileId,
    depth?: number,
  ): Promise<CurriculumNode[]> {
    const where: any = { curriculumId: curriculumId.unpack() };
    if (depth !== undefined) {
      where.depth = depth;
    }
    const records = await this.delegate.findMany({
      where,
      orderBy: [{ depth: 'asc' }, { name: 'asc' }],
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByParentId(parentId: CurriculumNodeId): Promise<CurriculumNode[]> {
    const records = await this.delegate.findMany({
      where: { parentNodeId: parentId.unpack() },
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findSubtreeByPath(pathPrefix: string): Promise<CurriculumNode[]> {
    const records = await this.delegate.findMany({
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
    const records = await this.delegate.findMany({
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
    const records = await this.delegate.findMany({
      where,
      orderBy: [{ depth: 'asc' }, { name: 'asc' }],
      take: 50,
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findRootNodes(curriculumId: CurriculumProfileId): Promise<CurriculumNode[]> {
    const records = await this.delegate.findMany({
      where: {
        curriculumId: curriculumId.unpack(),
        parentNodeId: null,
      },
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }
}
