import { GetOrganizationCurriculumOverviewHandler } from './get-org-curriculum-overview.handler';
import { GetOrganizationCurriculumOverviewQuery } from './get-org-curriculum-overview.query';
import {
  CurriculumProfileId,
  PlatformSubjectId,
  CurriculumNodeId,
} from '../../../domain';

describe('GetOrganizationCurriculumOverviewHandler', () => {
  let handler: GetOrganizationCurriculumOverviewHandler;
  let mockOrgQuery: any;
  let mockClassroomQuery: any;
  let mockUserQuery: any;
  let mockProfileRepo: any;
  let mockMappingRepo: any;

  beforeEach(() => {
    mockOrgQuery = {
      getOrganizationById: jest.fn(),
      getOrganizationSubjects: jest.fn(),
    };
    mockClassroomQuery = {
      getEnrolledStudentIds: jest.fn(),
    };
    mockUserQuery = {
      getStudentCurriculumContexts: jest.fn(),
    };
    mockProfileRepo = {
      findByJurisdictionCodes: jest.fn(),
    };
    mockMappingRepo = {
      findByCurriculumId: jest.fn(),
    };

    handler = new GetOrganizationCurriculumOverviewHandler(
      mockOrgQuery,
      mockClassroomQuery,
      mockUserQuery,
      mockProfileRepo,
      mockMappingRepo,
    );
  });

  it('resolves jurisdiction-scoped curricula and maps offered subjects correctly', async () => {
    mockOrgQuery.getOrganizationById.mockResolvedValue({
      id: 'org-1',
      country: 'GB',
      name: 'London Academy',
    });
    mockClassroomQuery.getEnrolledStudentIds.mockResolvedValue(['stu-1', 'stu-2']);
    mockUserQuery.getStudentCurriculumContexts.mockResolvedValue([
      { studentId: 'stu-1', countryCode: 'CA', gradeLevel: 'Grade 9' },
      { studentId: 'stu-2', countryCode: 'GB', gradeLevel: 'Year 10' },
    ]);

    mockOrgQuery.getOrganizationSubjects.mockResolvedValue([
      { id: 'subj-1', name: 'Maths Year 10', platformSubjectId: '018e0000-0000-7000-8000-000000000010', isActive: true },
      { id: 'subj-2', name: 'Robotics', platformSubjectId: null, isActive: true },
    ]);

    mockProfileRepo.findByJurisdictionCodes.mockResolvedValue([
      {
        id: CurriculumProfileId.from('018e0000-0000-7000-8000-000000000001'),
        name: 'England National Curriculum',
        shortCode: 'GB-NC',
        countryCode: 'GB',
        jurisdictionCode: 'GB-ENG',
        authority: 'DfE',
        description: null,
        version: '2024',
        sourceUrl: 'https://example.test/england',
        isActive: true,
      },
    ]);

    mockMappingRepo.findByCurriculumId.mockResolvedValue([
      {
        platformSubjectId: PlatformSubjectId.from('018e0000-0000-7000-8000-000000000010'),
        subjectNodeId: CurriculumNodeId.from('018e0000-0000-7000-8000-000000000100'),
      },
    ]);

    const result = await handler.execute(
      new GetOrganizationCurriculumOverviewQuery('org-1'),
    );

    expect(result.organizationId).toBe('org-1');
    expect(result.organizationCountry).toBe('GB');
    expect(result.coveredCountries).toContain('GB');
    expect(result.coveredCountries).toContain('CA');
    expect(result.coveredJurisdictions).toContain('GB-ENG');
    expect(result.coveredJurisdictions).toContain('CA-ON');
    expect(result.learnerGrades).toEqual(expect.arrayContaining(['Grade 9', 'Year 10']));
    expect(result.enrolledStudentCount).toBe(2);
    expect(result.offeredSubjects).toHaveLength(2);
    expect(result.unmappedSubjects).toHaveLength(1);
    expect(result.unmappedSubjects[0].name).toBe('Robotics');
    expect(result.curricula).toHaveLength(1);
    expect(result.curricula[0].shortCode).toBe('GB-NC');
  });
});
