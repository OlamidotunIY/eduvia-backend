import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IOrganizationQueryPort } from '@modules/shared';
import { SearchOrganizationCurriculumNodesQuery } from './search-org-curriculum-nodes.query';
import { CurriculumSearchResultDto } from '../search-curriculum-nodes/search-curriculum-nodes.dto';
import {
  CurriculumNode,
  CurriculumProfileId,
  ICurriculumNodeRepository,
  ISubjectCurriculumMappingRepository,
} from '../../../domain';

@QueryHandler(SearchOrganizationCurriculumNodesQuery)
export class SearchOrganizationCurriculumNodesHandler
  implements IQueryHandler<SearchOrganizationCurriculumNodesQuery, CurriculumSearchResultDto[]>
{
  constructor(
    private readonly orgQuery: IOrganizationQueryPort,
    private readonly nodeRepository: ICurriculumNodeRepository,
    private readonly mappingRepository: ISubjectCurriculumMappingRepository,
  ) {}

  async execute(
    query: SearchOrganizationCurriculumNodesQuery,
  ): Promise<CurriculumSearchResultDto[]> {
    const orgSubjects = await this.orgQuery.getOrganizationSubjects(
      query.organizationId,
      true,
    );
    const offeredPlatformSubjectIds = new Set(
      orgSubjects
        .map((s) => s.platformSubjectId)
        .filter((id): id is string => Boolean(id)),
    );

    if (offeredPlatformSubjectIds.size === 0) {
      return [];
    }

    const curriculumId = query.curriculumId
      ? CurriculumProfileId.from(query.curriculumId)
      : undefined;

    const rawNodes = await this.nodeRepository.search(query.query, curriculumId);
    if (rawNodes.length === 0) {
      return [];
    }

    // Get all relevant mappings
    const allowedSubjectNodeIds = new Set<string>();
    if (query.curriculumId) {
      const mappings = await this.mappingRepository.findByCurriculumId(
        query.curriculumId,
      );
      for (const m of mappings) {
        if (offeredPlatformSubjectIds.has(m.platformSubjectId.unpack())) {
          allowedSubjectNodeIds.add(m.subjectNodeId.unpack());
        }
      }
    } else {
      // Find across all offered platform subjects
      for (const platformSubjectId of offeredPlatformSubjectIds) {
        const mappings = await this.mappingRepository.findByPlatformSubjectId(
          platformSubjectId,
        );
        for (const m of mappings) {
          allowedSubjectNodeIds.add(m.subjectNodeId.unpack());
        }
      }
    }

    // Helper to check if node path intersects allowed subject nodes
    const isAllowed = (node: CurriculumNode): boolean => {
      if (node.nodeType === 'subject') {
        return allowedSubjectNodeIds.has(node.id.unpack());
      }
      // Check if path contains any allowed subject node ID
      for (const allowedSubjectId of allowedSubjectNodeIds) {
        if (node.path.value.includes(allowedSubjectId)) {
          return true;
        }
      }
      return false;
    };

    return rawNodes
      .filter((node) => isAllowed(node))
      .map((node) => ({
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
