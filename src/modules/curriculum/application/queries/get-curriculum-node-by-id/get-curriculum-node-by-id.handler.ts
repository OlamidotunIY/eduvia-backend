import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCurriculumNodeByIdQuery } from './get-curriculum-node-by-id.query';
import { CurriculumNodeDetailDto } from './get-curriculum-node-by-id.dto';
import {
  CurriculumNodeId,
  CurriculumNodeNotFoundError,
  ICurriculumNodeRepository,
} from '../../../domain';

@QueryHandler(GetCurriculumNodeByIdQuery)
export class GetCurriculumNodeByIdHandler
  implements IQueryHandler<GetCurriculumNodeByIdQuery, CurriculumNodeDetailDto>
{
  constructor(private readonly nodeRepository: ICurriculumNodeRepository) {}

  async execute(query: GetCurriculumNodeByIdQuery): Promise<CurriculumNodeDetailDto> {
    const node = await this.nodeRepository.findById(CurriculumNodeId.from(query.nodeId));
    if (!node) {
      throw new CurriculumNodeNotFoundError(query.nodeId);
    }

    const children = await this.nodeRepository.findByParentId(node.id);

    return {
      id: node.id.unpack(),
      curriculumId: node.curriculumId.unpack(),
      parentNodeId: node.parentNodeId ? node.parentNodeId.unpack() : null,
      nodeType: node.nodeType,
      name: node.name,
      code: node.code,
      description: node.description,
      gradeLevel: node.gradeLevel,
      depth: node.depth,
      path: node.path.value,
      isLeaf: node.isLeaf,
      isActive: node.isActive,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      children: children.map((c) => ({
        id: c.id.unpack(),
        name: c.name,
        code: c.code,
        nodeType: c.nodeType,
        isLeaf: c.isLeaf,
      })),
    };
  }
}
