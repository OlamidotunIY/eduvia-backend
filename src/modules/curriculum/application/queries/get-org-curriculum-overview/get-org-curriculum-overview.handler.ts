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

    // 1. Resolve student countries from active classroom enrollments
    const enrolledStudentIds = await this.classroomQuery.getEnrolledStudentIds(
      query.organizationId,
    );
    const studentCountryCodes = await this.userQuery.getStudentCountryCodes(
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

    // 2. Build covered country set: org country + enrolled student countries + international
    const coveredCountriesSet = new Set<string>();
    if (org.country) {
      coveredCountriesSet.add(normalizeCountry(org.country));
    }
    for (const code of studentCountryCodes) {
      if (code) {
        coveredCountriesSet.add(normalizeCountry(code));
      }
    }
    // Also include international standards (INT)
    coveredCountriesSet.add('INT');

    const coveredCountries = Array.from(coveredCountriesSet);

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
    let matchingProfiles = await this.profileRepository.findByCountryCodes(
      coveredCountries,
    );
    if (matchingProfiles.length === 0) {
      matchingProfiles = await this.profileRepository.findActive();
    }

    // 5. For each profile, count how many offered subjects are mapped
    const curricula: OrganizationScopedCurriculumProfileDto[] = [];

    for (const profile of matchingProfiles) {
      const mappings = await this.mappingRepository.findByCurriculumId(
        profile.id.unpack(),
      );
      const mappedOfferedSubjectCount = mappings.filter((m) =>
        offeredPlatformSubjectIds.has(m.platformSubjectId.unpack()),
      ).length;

      curricula.push({
        id: profile.id.unpack(),
        name: profile.name,
        shortCode: profile.shortCode,
        countryCode: profile.countryCode,
        authority: profile.authority,
        description: profile.description,
        version: profile.version,
        isActive: profile.isActive,
        mappedOfferedSubjectCount,
      });
    }

    return {
      organizationId: org.id,
      organizationCountry: org.country,
      coveredCountries,
      enrolledStudentCount: enrolledStudentIds.length,
      offeredSubjects,
      unmappedSubjects,
      curricula,
    };
  }
}
