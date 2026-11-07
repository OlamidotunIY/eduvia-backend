export interface ResolvedStudentCurriculumDto {
  curriculum: {
    id: string;
    name: string;
    shortCode: string;
    countryCode: string;
    jurisdictionCode: string;
    description: string | null;
    authority: string;
    version: string | null;
    sourceUrl: string | null;
  };
}
