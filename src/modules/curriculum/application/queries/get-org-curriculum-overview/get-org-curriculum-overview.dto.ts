export interface OrganizationOfferedSubjectSummaryDto {
  id: string;
  name: string;
  platformSubjectId: string | null;
  isMapped: boolean;
}

export interface OrganizationUnmappedSubjectDto {
  id: string;
  name: string;
}

export interface OrganizationScopedCurriculumProfileDto {
  id: string;
  name: string;
  shortCode: string;
  countryCode: string;
  jurisdictionCode: string;
  authority: string;
  description: string | null;
  version: string | null;
  sourceUrl: string | null;
  isActive: boolean;
  mappedOfferedSubjectCount: number;
}

export interface OrganizationCurriculumOverviewDto {
  organizationId: string;
  organizationCountry: string;
  coveredCountries: string[];
  coveredJurisdictions: string[];
  learnerGrades: string[];
  enrolledStudentCount: number;
  offeredSubjects: OrganizationOfferedSubjectSummaryDto[];
  unmappedSubjects: OrganizationUnmappedSubjectDto[];
  curricula: OrganizationScopedCurriculumProfileDto[];
}
