import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationCurriculumTreeQuery } from './get-org-curriculum-tree.query';
import { OrganizationCurriculumTreeNodeDto } from './get-org-curriculum-tree.dto';
import {
  CurriculumProfileId,
  CurriculumProfileNotFoundError,
  ICurriculumNodeRepository,
  ICurriculumProfileRepository,
} from '../../../domain';

@QueryHandler(GetOrganizationCurriculumTreeQuery)
export class GetOrganizationCurriculumTreeHandler
  implements IQueryHandler<GetOrganizationCurriculumTreeQuery, OrganizationCurriculumTreeNodeDto[]>
{
  constructor(
    private readonly profileRepository: ICurriculumProfileRepository,
    private readonly nodeRepository: ICurriculumNodeRepository,
  ) {}

  async execute(
    query: GetOrganizationCurriculumTreeQuery,
  ): Promise<OrganizationCurriculumTreeNodeDto[]> {
    const profile = await this.profileRepository.findById(
      CurriculumProfileId.from(query.curriculumId),
    );
    if (!profile) {
      throw new CurriculumProfileNotFoundError(query.curriculumId);
    }

    // Curriculum entitlement is established by the organization overview.
    // Once a profile is returned there, its detail tree is never reshaped by
    // learner enrollment, grade, or a subset of the organization's subjects.
    // A teacher must be able to inspect the full official hierarchy before a
    // learner is enrolled or placed in a grade.
    const nodes = await this.nodeRepository.findByCurriculumId(profile.id);
    if (nodes.length === 0) return [];

    // Build the complete profile hierarchy.
    const dtoMap = new Map<string, OrganizationCurriculumTreeNodeDto>();

    for (const node of nodes) {
      const nodeId = node.id.unpack();
      dtoMap.set(nodeId, {
        id: nodeId,
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

    // Connect parents and children to form roots.
    const roots: OrganizationCurriculumTreeNodeDto[] = [];

    for (const item of dtoMap.values()) {
      if (item.parentNodeId && dtoMap.has(item.parentNodeId)) {
        dtoMap.get(item.parentNodeId)!.children.push(item);
      } else {
        roots.push(item);
      }
    }

    return roots;
  }
}
