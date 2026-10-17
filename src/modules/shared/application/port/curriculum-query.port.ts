export interface SharedCurriculumProfileDto {
  id: string;
  name: string;
  shortCode: string;
  countryCode: string;
  description: string | null;
  authority: string;
  isActive: boolean;
  version: string | null;
}

export interface SharedCurriculumNodeDto {
  id: string;
  curriculumId: string;
  parentNodeId: string | null;
  nodeType: string;
  name: string;
  code: string | null;
  description: string | null;
  gradeLevel: string | null;
  depth: number;
  path: string;
  isLeaf: boolean;
  isActive: boolean;
}

export interface SharedPlatformSubjectDto {
  id: string;
  name: string;
  shortCode: string;
  description: string | null;
  isActive: boolean;
}

export interface SharedSubjectCurriculumMappingDto {
  id: string;
  platformSubjectId: string;
  curriculumId: string;
  subjectNodeId: string;
}

export abstract class ICurriculumQueryPort {
  public abstract getCurriculumProfileById(
    id: string,
  ): Promise<SharedCurriculumProfileDto | null>;

  public abstract getCurriculumNodeById(
    id: string,
  ): Promise<SharedCurriculumNodeDto | null>;

  public abstract isLeafNode(id: string): Promise<boolean>;

  public abstract getSubjectCurriculumMapping(
    platformSubjectId: string,
    curriculumId: string,
  ): Promise<SharedSubjectCurriculumMappingDto | null>;

  public abstract resolveStudentCurriculum(
    countryCode: string,
  ): Promise<SharedCurriculumProfileDto | null>;

  public abstract getCurriculumNodesByPath(
    pathPrefix: string,
  ): Promise<SharedCurriculumNodeDto[]>;

  public abstract getLeafNodes(
    curriculumId: string,
  ): Promise<SharedCurriculumNodeDto[]>;

  public abstract getPlatformSubjectById(
    id: string,
  ): Promise<SharedPlatformSubjectDto | null>;
}
