import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListCurriculumNodesQuery } from './list-curriculum-nodes.query';
import { CurriculumNodeDto } from './list-curriculum-nodes.dto';
import {
  CurriculumProfileId,
  ICurriculumNodeRepository,
} from '../../../domain';

@QueryHandler(ListCurriculumNodesQuery)
export class ListCurriculumNodesHandler
  implements IQueryHandler<ListCurriculumNodesQuery, CurriculumNodeDto[]>
{
  constructor(private readonly nodeRepository: ICurriculumNodeRepository) {}

  async execute(query: ListCurriculumNodesQuery): Promise<CurriculumNodeDto[]> {
    const nodes = await this.nodeRepository.findByCurriculumId(
      CurriculumProfileId.from(query.curriculumId),
      query.depth,
    );

    return nodes.map((node) => ({
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
    }));
  }
}
