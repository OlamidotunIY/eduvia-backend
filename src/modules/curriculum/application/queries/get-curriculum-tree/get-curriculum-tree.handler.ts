import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCurriculumTreeQuery } from './get-curriculum-tree.query';
import { CurriculumTreeNodeDto } from './get-curriculum-tree.dto';
import {
  CurriculumProfileId,
  CurriculumProfileNotFoundError,
  ICurriculumNodeRepository,
  ICurriculumProfileRepository,
} from '../../../domain';

@QueryHandler(GetCurriculumTreeQuery)
export class GetCurriculumTreeHandler
  implements IQueryHandler<GetCurriculumTreeQuery, CurriculumTreeNodeDto[]>
{
  constructor(
    private readonly profileRepository: ICurriculumProfileRepository,
    private readonly nodeRepository: ICurriculumNodeRepository,
  ) {}

  async execute(query: GetCurriculumTreeQuery): Promise<CurriculumTreeNodeDto[]> {
    const profile = await this.profileRepository.findById(CurriculumProfileId.from(query.curriculumId));
    if (!profile) {
      throw new CurriculumProfileNotFoundError(query.curriculumId);
    }

    const nodes = await this.nodeRepository.findByCurriculumId(profile.id);

    const nodeMap = new Map<string, CurriculumTreeNodeDto>();
    for (const node of nodes) {
      nodeMap.set(node.id.unpack(), {
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
        children: [],
      });
    }

    const roots: CurriculumTreeNodeDto[] = [];
    for (const item of nodeMap.values()) {
      if (item.parentNodeId && nodeMap.has(item.parentNodeId)) {
        nodeMap.get(item.parentNodeId)!.children.push(item);
      } else {
        roots.push(item);
      }
    }

    return roots;
  }
}
