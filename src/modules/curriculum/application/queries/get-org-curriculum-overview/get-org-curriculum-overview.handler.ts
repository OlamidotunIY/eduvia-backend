import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IClassroomQueryPort,
  IOrganizationQueryPort,
  IUserQueryPort,
} from '@modules/shared';
import { GetOrganizationCurriculumOverviewQuery } from './get-org-curriculum-overview.query';
import {
  OrganizationCurriculumOverviewDto,
  OrganizationOfferedSubjectSummaryDto,
  OrganizationScopedCurriculumProfileDto,
  OrganizationUnmappedSubjectDto,
} from './get-org-curriculum-overview.dto';
import {
  CurriculumProfileNotFoundError,
  ICurriculumProfileRepository,
  ISubjectCurriculumMappingRepository,
} from '../../../domain';

@QueryHandler(GetOrganizationCurriculumOverviewQuery)
export class GetOrganizationCurriculumOverviewHandler
  implements IQueryHandler<GetOrganizationCurriculumOverviewQuery, OrganizationCurriculumOverviewDto>
{
  constructor(
    private readonly orgQuery: IOrganizationQueryPort,
    private readonly classroomQuery: IClassroomQueryPort,
    private readonly userQuery: IUserQueryPort,
    private readonly profileRepository: ICurriculumProfileRepository,
    private readonly mappingRepository: ISubjectCurriculumMappingRepository,
  ) {}

  async execute(
    query: GetOrganizationCurriculumOverviewQuery,
  ): Promise<OrganizationCurriculumOverviewDto> {
    const org = await this.orgQuery.getOrganizationById(query.organizationId);
    if (!org) {
      throw new CurriculumProfileNotFoundError(`organization:${query.organizationId}`);
    }

    // 1. Resolve learner contexts from active classroom enrollments. Country is
    // not granular enough for curricula: Ontario and England are jurisdictions.
    const enrolledStudentIds = await this.classroomQuery.getEnrolledStudentIds(
      query.organizationId,
    );
    const learnerContexts = await this.userQuery.getStudentCurriculumContexts(
      enrolledStudentIds,
    );

    const countryToIso2: Record<string, string> = {
      nigeria: 'NG',
      'united kingdom': 'GB',
      uk: 'GB',
      'great britain': 'GB',
      england: 'GB',
      canada: 'CA',
      'united states': 'US',
      usa: 'US',
      ghana: 'GH',
      kenya: 'KE',
      'south africa': 'ZA',
    };

    const normalizeCountry = (val: string) => {
      const lower = val.trim().toLowerCase();
      return countryToIso2[lower] ?? val.trim().toUpperCase();
    };

    const jurisdictionByCountry: Record<string, string> = {
      CA: 'CA-ON',
      NG: 'NG',
      GB: 'GB-ENG',
    };

    // 2. Build explicit learning contexts. There is deliberately no fallback to
    // every active profile: organizations should only see curricula they teach.
    const coveredCountriesSet = new Set<string>();
    if (org.country) {
      coveredCountriesSet.add(normalizeCountry(org.country));
    }
    for (const learner of learnerContexts) {
      if (learner.countryCode) {
        coveredCountriesSet.add(normalizeCountry(learner.countryCode));
      }
    }
    const coveredCountries = Array.from(coveredCountriesSet);
    const coveredJurisdictions = coveredCountries
      .map((country) => jurisdictionByCountry[country])
      .filter((value): value is string => Boolean(value));
    const learnerGrades = Array.from(
      new Set(
        learnerContexts
          .map((learner) => learner.gradeLevel)
          .filter((grade): grade is string => Boolean(grade)),
      ),
    );

    // 3. Resolve organization offered subjects
    const orgSubjects = await this.orgQuery.getOrganizationSubjects(
      query.organizationId,
      true,
    );

    const offeredSubjects: OrganizationOfferedSubjectSummaryDto[] = [];
    const unmappedSubjects: OrganizationUnmappedSubjectDto[] = [];
    const offeredPlatformSubjectIds = new Set<string>();

    for (const s of orgSubjects) {
      const isMapped = Boolean(s.platformSubjectId);
      offeredSubjects.push({
        id: s.id,
        name: s.name,
        platformSubjectId: s.platformSubjectId,
        isMapped,
      });

      if (s.platformSubjectId) {
        offeredPlatformSubjectIds.add(s.platformSubjectId);
      } else {
        unmappedSubjects.push({
          id: s.id,
          name: s.name,
        });
      }
    }

    // 4. Fetch curriculum profiles for covered countries
    const matchingProfiles = await this.profileRepository.findByJurisdictionCodes(
      coveredJurisdictions,
    );

    // 5. For each profile, count how many offered subjects are mapped
    const curricula: OrganizationScopedCurriculumProfileDto[] = [];

    for (const profile of matchingProfiles) {
      const mappings = await this.mappingRepository.findByCurriculumId(
        profile.id.unpack(),
      );
      const mappedOfferedSubjectCount = mappings.filter((m) =>
        offeredPlatformSubjectIds.has(m.platformSubjectId.unpack()),
      ).length;

      if (mappedOfferedSubjectCount === 0) {
        continue;
      }

      curricula.push({
        id: profile.id.unpack(),
        name: profile.name,
        shortCode: profile.shortCode,
        countryCode: profile.countryCode,
        jurisdictionCode: profile.jurisdictionCode,
        authority: profile.authority,
        description: profile.description,
        version: profile.version,
        sourceUrl: profile.sourceUrl,
        isActive: profile.isActive,
        mappedOfferedSubjectCount,
      });
    }

    return {
      organizationId: org.id,
      organizationCountry: org.country,
      coveredCountries,
      coveredJurisdictions,
      learnerGrades,
      enrolledStudentCount: enrolledStudentIds.length,
      offeredSubjects,
      unmappedSubjects,
      curricula,
    };
  }
}
