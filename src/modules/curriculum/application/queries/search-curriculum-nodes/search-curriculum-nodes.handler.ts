import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchCurriculumNodesQuery } from './search-curriculum-nodes.query';
import { CurriculumSearchResultDto } from './search-curriculum-nodes.dto';
import {
  CurriculumProfileId,
  ICurriculumNodeRepository,
} from '../../../domain';

@QueryHandler(SearchCurriculumNodesQuery)
export class SearchCurriculumNodesHandler
  implements IQueryHandler<SearchCurriculumNodesQuery, CurriculumSearchResultDto[]>
{
  constructor(private readonly nodeRepository: ICurriculumNodeRepository) {}

  async execute(query: SearchCurriculumNodesQuery): Promise<CurriculumSearchResultDto[]> {
    const curriculumId = query.curriculumId ? CurriculumProfileId.from(query.curriculumId) : undefined;
    const nodes = await this.nodeRepository.search(query.query, curriculumId);

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
    }));
  }
}
