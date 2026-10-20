import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  CurriculumNode,
  CurriculumNodeId,
  CurriculumProfileId,
  NodePath,
  NodeType,
} from '../../../domain';
import { CurriculumNode as PrismaCurriculumNode } from '@generated/prisma/client';

@Injectable()
export class CurriculumNodeMapper implements IMapper<CurriculumNode, PrismaCurriculumNode> {
  public toDomain(record: PrismaCurriculumNode): CurriculumNode {
    return CurriculumNode.reconstitute({
      id: CurriculumNodeId.from(record.id),
      curriculumId: CurriculumProfileId.from(record.curriculumId),
      parentNodeId: record.parentNodeId ? CurriculumNodeId.from(record.parentNodeId) : null,
      nodeType: record.nodeType as NodeType,
      name: record.name,
      code: record.code,
      description: record.description,
      gradeLevel: record.gradeLevel,
      depth: record.depth,
      path: NodePath.from(record.path),
      isLeaf: record.isLeaf,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public toPersistence(entity: CurriculumNode): Omit<PrismaCurriculumNode, 'id'> {
    return {
      curriculumId: entity.curriculumId.unpack(),
      parentNodeId: entity.parentNodeId ? entity.parentNodeId.unpack() : null,
      nodeType: entity.nodeType as any,
      name: entity.name,
      code: entity.code,
      description: entity.description,
      gradeLevel: entity.gradeLevel,
      depth: entity.depth,
      path: entity.path.value,
      isLeaf: entity.isLeaf,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
