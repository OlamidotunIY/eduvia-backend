import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IOrganizationQueryPort } from '@modules/shared';
import { GetOrganizationCurriculumTreeQuery } from './get-org-curriculum-tree.query';
import { OrganizationCurriculumTreeNodeDto } from './get-org-curriculum-tree.dto';
import {
  CurriculumProfileId,
  CurriculumProfileNotFoundError,
  ICurriculumNodeRepository,
  ICurriculumProfileRepository,
  ISubjectCurriculumMappingRepository,
} from '../../../domain';

@QueryHandler(GetOrganizationCurriculumTreeQuery)
export class GetOrganizationCurriculumTreeHandler
  implements IQueryHandler<GetOrganizationCurriculumTreeQuery, OrganizationCurriculumTreeNodeDto[]>
{
  constructor(
    private readonly orgQuery: IOrganizationQueryPort,
    private readonly profileRepository: ICurriculumProfileRepository,
    private readonly nodeRepository: ICurriculumNodeRepository,
    private readonly mappingRepository: ISubjectCurriculumMappingRepository,
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

    // 1. Fetch organization offered subjects
    const orgSubjects = await this.orgQuery.getOrganizationSubjects(
      query.organizationId,
      true,
    );
    const offeredPlatformSubjectIds = new Set(
      orgSubjects
        .map((s) => s.platformSubjectId)
        .filter((id): id is string => Boolean(id)),
    );

    const isPreview = query.preview === true;

    // If org has no mapped platform subjects and preview is not requested, return empty tree
    if (!isPreview && offeredPlatformSubjectIds.size === 0) {
      return [];
    }

    // Load all nodes for this curriculum
    const nodes = await this.nodeRepository.findByCurriculumId(profile.id);
    if (!nodes || nodes.length === 0) {
      return [];
    }

    if (isPreview) {
      const rawMap = new Map<string, (typeof nodes)[0]>();
      const childrenMap = new Map<string, string[]>();
      const rootIds: string[] = [];

      for (const node of nodes) {
        rawMap.set(node.id.unpack(), node);
        const parentId = node.parentNodeId?.unpack() ?? null;
        if (!parentId) {
          rootIds.push(node.id.unpack());
        } else {
          const siblings = childrenMap.get(parentId) ?? [];
          siblings.push(node.id.unpack());
          childrenMap.set(parentId, siblings);
        }
      }

      const buildSubtree = (nodeId: string): OrganizationCurriculumTreeNodeDto => {
        const node = rawMap.get(nodeId)!;
        const childIds = childrenMap.get(nodeId) ?? [];
        return {
          id: node.id.unpack(),
          curriculumId: node.curriculumId.unpack(),
          parentNodeId: node.parentNodeId ? node.parentNodeId.unpack() : null,
          nodeType: node.nodeType,
          name: node.name,
          code: node.code ?? null,
          description: node.description,
          gradeLevel: node.gradeLevel,
          depth: node.depth,
          path: node.path.value,
          isLeaf: node.isLeaf,
          isActive: node.isActive,
          children: childIds.map(buildSubtree),
        };
      };

      return rootIds.map(buildSubtree);
    }

    // 2. Fetch mappings for this curriculum
    const mappings = await this.mappingRepository.findByCurriculumId(
      query.curriculumId,
    );
    const allowedSubjectNodeIds = new Set<string>();

    for (const mapping of mappings) {
      if (offeredPlatformSubjectIds.has(mapping.platformSubjectId.unpack())) {
        allowedSubjectNodeIds.add(mapping.subjectNodeId.unpack());
      }
    }

    if (allowedSubjectNodeIds.size === 0) {
      return [];
    }

    // Index nodes by ID
    const rawMap = new Map<string, (typeof nodes)[0]>();
    for (const node of nodes) {
      rawMap.set(node.id.unpack(), node);
    }

    // Helper: find subject ancestor ID for a node
    const getSubjectAncestorId = (nodeId: string): string | null => {
      let current = rawMap.get(nodeId);
      while (current) {
        if (current.nodeType === 'subject') {
          return current.id.unpack();
        }
        if (!current.parentNodeId) break;
        current = rawMap.get(current.parentNodeId.unpack());
      }
      return null;
    };

    // Helper: check if a node or any of its descendants belongs to allowed subjects
    const isNodeAllowed = (nodeId: string): boolean => {
      const node = rawMap.get(nodeId);
      if (!node) return false;

      // Subject level
      if (node.nodeType === 'subject') {
        return allowedSubjectNodeIds.has(node.id.unpack());
      }

      // Descendants of subject (strand, topic, learning_objective)
      if (node.depth > 1) {
        const subjectId = getSubjectAncestorId(nodeId);
        return subjectId !== null && allowedSubjectNodeIds.has(subjectId);
      }

      // Ancestors of subject (e.g. keystage / depth 0)
      // Check if ANY child subject of this keystage is allowed
      for (const child of nodes) {
        if (
          child.parentNodeId &&
          child.parentNodeId.unpack() === nodeId &&
          child.nodeType === 'subject' &&
          allowedSubjectNodeIds.has(child.id.unpack())
        ) {
          return true;
        }
      }

      return false;
    };

    // 4. Build DTO map for allowed nodes
    const dtoMap = new Map<string, OrganizationCurriculumTreeNodeDto>();

    for (const node of nodes) {
      const nodeId = node.id.unpack();
      if (isNodeAllowed(nodeId)) {
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
    }

    // 5. Connect parents and children to form roots
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
