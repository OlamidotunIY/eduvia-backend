import { SearchOrganizationCurriculumNodesHandler } from './search-org-curriculum-nodes.handler';
import { SearchOrganizationCurriculumNodesQuery } from './search-org-curriculum-nodes.query';
import {
  CurriculumProfileId,
  CurriculumNodeId,
  NodePath,
} from '../../../domain';

describe('SearchOrganizationCurriculumNodesHandler', () => {
  let handler: SearchOrganizationCurriculumNodesHandler;
  let mockOrgQuery: any;
  let mockNodeRepo: any;
  let mockMappingRepo: any;

  const curriculumId = '018e0000-0000-7000-8000-000000000001';
  const mathsSubjectId = '018e0000-0000-7000-8000-000000000020';
  const frenchSubjectId = '018e0000-0000-7000-8000-000000000030';
  const topicId = '018e0000-0000-7000-8000-000000000050';

  beforeEach(() => {
    mockOrgQuery = {
      getOrganizationSubjects: jest.fn(),
    };
    mockNodeRepo = {
      search: jest.fn(),
    };
    mockMappingRepo = {
      findByCurriculumId: jest.fn(),
      findByPlatformSubjectId: jest.fn(),
    };

    handler = new SearchOrganizationCurriculumNodesHandler(
      mockOrgQuery,
      mockNodeRepo,
      mockMappingRepo,
    );
  });

  it('filters search results to only allowed subject paths', async () => {
    mockOrgQuery.getOrganizationSubjects.mockResolvedValue([
      { id: 'subj-1', name: 'Mathematics', platformSubjectId: '018e0000-0000-7000-8000-000000000100', isActive: true },
    ]);

    mockMappingRepo.findByCurriculumId.mockResolvedValue([
      {
        platformSubjectId: '018e0000-0000-7000-8000-000000000100',
        subjectNodeId: mathsSubjectId,
      },
    ]);

    mockNodeRepo.search.mockResolvedValue([
      {
        id: CurriculumNodeId.from(topicId),
        curriculumId: CurriculumProfileId.from(curriculumId),
        parentNodeId: CurriculumNodeId.from(mathsSubjectId),
        nodeType: 'topic',
        name: 'Equations',
        code: 'EQ-01',
        description: null,
        gradeLevel: 'Year 10',
        depth: 3,
        path: NodePath.from('/ks/' + mathsSubjectId + '/' + topicId + '/'),
        isLeaf: false,
        isActive: true,
      },
      {
        id: CurriculumNodeId.from('018e0000-0000-7000-8000-000000000099'),
        curriculumId: CurriculumProfileId.from(curriculumId),
        parentNodeId: CurriculumNodeId.from(frenchSubjectId),
        nodeType: 'topic',
        name: 'French Equations (Unrelated)',
        code: 'FRE-EQ',
        description: null,
        gradeLevel: 'Year 10',
        depth: 3,
        path: NodePath.from('/ks/' + frenchSubjectId + '/018e0000-0000-7000-8000-000000000099/'),
        isLeaf: false,
        isActive: true,
      },
    ]);

    const results = await handler.execute(
      new SearchOrganizationCurriculumNodesQuery('org-1', 'Equations', curriculumId),
    );

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Equations');
    expect(results[0].code).toBe('EQ-01');
  });
});
