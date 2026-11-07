import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IClassroomQueryPort,
  IOrganizationQueryPort,
  IUserQueryPort,
} from '@modules/shared';
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
    private readonly classroomQuery: IClassroomQueryPort,
    private readonly userQuery: IUserQueryPort,
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

    if (offeredPlatformSubjectIds.size === 0) {
      return [];
    }

    // Load all nodes for this curriculum
    const nodes = await this.nodeRepository.findByCurriculumId(profile.id);
    if (!nodes || nodes.length === 0) {
      return [];
    }

    // 2. Fetch mapped discipline roots for this curriculum.
    const mappings = await this.mappingRepository.findByCurriculumId(
      query.curriculumId,
    );
    const allowedDisciplineNodeIds = new Set<string>();

    for (const mapping of mappings) {
      if (offeredPlatformSubjectIds.has(mapping.platformSubjectId)) {
        allowedDisciplineNodeIds.add(mapping.subjectNodeId);
      }
    }

    if (allowedDisciplineNodeIds.size === 0) {
      return [];
    }

    // Index nodes by ID
    const rawMap = new Map<string, (typeof nodes)[0]>();
    for (const node of nodes) {
      rawMap.set(node.id.unpack(), node);
    }

    const enrolledStudentIds = await this.classroomQuery.getEnrolledStudentIds(
      query.organizationId,
    );
    const learnerContexts = await this.userQuery.getStudentCurriculumContexts(
      enrolledStudentIds,
    );
    const learnerGrades = new Set(
      learnerContexts
        .map((learner) => learner.gradeLevel?.trim().toLowerCase())
        .filter((grade): grade is string => Boolean(grade)),
    );

    const allowedCourseNodeIds = new Set(
      nodes
        .filter(
          (node) =>
            node.nodeType === 'course' &&
            Boolean(node.gradeLevel) &&
            learnerGrades.has(node.gradeLevel!.trim().toLowerCase()),
        )
        .map((node) => node.id.unpack()),
    );
    const profileHasCourses = nodes.some((node) => node.nodeType === 'course');

    const isDescendantOf = (nodeId: string, ancestorId: string): boolean =>
      nodeId === ancestorId ||
      rawMap.get(nodeId)?.path.value.includes(`/${ancestorId}/`) === true;

    // A mapped discipline and all descendants are visible. Its ancestors remain
    // visible as breadcrumbs, so the organization tree never becomes hollow.
    const isNodeAllowed = (nodeId: string): boolean => {
      const node = rawMap.get(nodeId);
      if (!node) return false;
      const id = node.id.unpack();
      const belongsToMappedDiscipline = Array.from(allowedDisciplineNodeIds).some(
        (rootId) => isDescendantOf(id, rootId) || isDescendantOf(rootId, id),
      );
      if (!belongsToMappedDiscipline) return false;

      // Courses are the grade-specific unit of delivery. Nodes above a course
      // remain only as a breadcrumb; courses for other learner grades vanish.
      return !profileHasCourses || Array.from(allowedCourseNodeIds).some(
        (courseId) => isDescendantOf(id, courseId) || isDescendantOf(courseId, id),
      );
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
