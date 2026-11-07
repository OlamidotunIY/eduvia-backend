import { GetOrganizationCurriculumTreeHandler } from './get-org-curriculum-tree.handler';
import { GetOrganizationCurriculumTreeQuery } from './get-org-curriculum-tree.query';
import {
  CurriculumProfileId,
  CurriculumNodeId,
  NodePath,
} from '../../../domain';

describe('GetOrganizationCurriculumTreeHandler', () => {
  let handler: GetOrganizationCurriculumTreeHandler;
  let mockProfileRepo: any;
  let mockNodeRepo: any;

  const curriculumId = '018e0000-0000-7000-8000-000000000001';
  const ks3Id = '018e0000-0000-7000-8000-000000000010';
  const mathsSubjectId = '018e0000-0000-7000-8000-000000000020';
  const frenchSubjectId = '018e0000-0000-7000-8000-000000000030';
  const algebraStrandId = '018e0000-0000-7000-8000-000000000040';

  beforeEach(() => {
    mockProfileRepo = {
      findById: jest.fn(),
    };
    mockNodeRepo = {
      findByCurriculumId: jest.fn(),
    };
    handler = new GetOrganizationCurriculumTreeHandler(
      mockProfileRepo,
      mockNodeRepo,
    );
  });

  it('returns the complete curriculum tree after the profile has been selected', async () => {
    mockProfileRepo.findById.mockResolvedValue({
      id: CurriculumProfileId.from(curriculumId),
      name: 'England National Curriculum',
    });

    mockNodeRepo.findByCurriculumId.mockResolvedValue([
      {
        id: CurriculumNodeId.from(ks3Id),
        curriculumId: CurriculumProfileId.from(curriculumId),
        parentNodeId: null,
        nodeType: 'keystage',
        name: 'Key Stage 3',
        code: 'KS3',
        description: null,
        gradeLevel: 'Year 7-9',
        depth: 0,
        path: NodePath.from('/' + ks3Id + '/'),
        isLeaf: false,
        isActive: true,
      },
      {
        id: CurriculumNodeId.from(mathsSubjectId),
        curriculumId: CurriculumProfileId.from(curriculumId),
        parentNodeId: CurriculumNodeId.from(ks3Id),
        nodeType: 'subject',
        name: 'Mathematics',
        code: 'MAT-KS3',
        description: null,
        gradeLevel: 'Year 7-9',
        depth: 1,
        path: NodePath.from('/' + ks3Id + '/' + mathsSubjectId + '/'),
        isLeaf: false,
        isActive: true,
      },
      {
        id: CurriculumNodeId.from(algebraStrandId),
        curriculumId: CurriculumProfileId.from(curriculumId),
        parentNodeId: CurriculumNodeId.from(mathsSubjectId),
        nodeType: 'strand',
        name: 'Algebra',
        code: 'MAT-KS3-ALG',
        description: null,
        gradeLevel: 'Year 7-9',
        depth: 2,
        path: NodePath.from('/' + ks3Id + '/' + mathsSubjectId + '/' + algebraStrandId + '/'),
        isLeaf: false,
        isActive: true,
      },
      {
        id: CurriculumNodeId.from(frenchSubjectId),
        curriculumId: CurriculumProfileId.from(curriculumId),
        parentNodeId: CurriculumNodeId.from(ks3Id),
        nodeType: 'subject',
        name: 'French',
        code: 'FRE-KS3',
        description: null,
        gradeLevel: 'Year 7-9',
        depth: 1,
        path: NodePath.from('/' + ks3Id + '/' + frenchSubjectId + '/'),
        isLeaf: false,
        isActive: true,
      },
    ]);

    const tree = await handler.execute(
      new GetOrganizationCurriculumTreeQuery('org-1', curriculumId),
    );

    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe('Key Stage 3');
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children[0].name).toBe('Mathematics');
    expect(tree[0].children[0].children).toHaveLength(1);
    expect(tree[0].children[0].children[0].name).toBe('Algebra');
    const subjectNames = tree[0].children.map((c) => c.name);
    expect(subjectNames).toContain('French');
  });
});
