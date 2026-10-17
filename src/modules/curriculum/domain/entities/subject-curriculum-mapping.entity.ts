import { SubjectCurriculumMappingId } from '../value-objects';

export interface SubjectCurriculumMappingProps {
  id: SubjectCurriculumMappingId;
  platformSubjectId: string;
  curriculumId: string;
  subjectNodeId: string;
  createdAt: Date;
}

export class SubjectCurriculumMapping {
  public readonly id: SubjectCurriculumMappingId;
  private _platformSubjectId: string;
  private _curriculumId: string;
  private _subjectNodeId: string;
  private _createdAt: Date;

  private constructor(props: SubjectCurriculumMappingProps) {
    this.id = props.id;
    this._platformSubjectId = props.platformSubjectId;
    this._curriculumId = props.curriculumId;
    this._subjectNodeId = props.subjectNodeId;
    this._createdAt = new Date(props.createdAt);
  }

  public static create(props: {
    id?: SubjectCurriculumMappingId;
    platformSubjectId: string;
    curriculumId: string;
    subjectNodeId: string;
  }): SubjectCurriculumMapping {
    return new SubjectCurriculumMapping({
      id: props.id ?? SubjectCurriculumMappingId.create(),
      platformSubjectId: props.platformSubjectId,
      curriculumId: props.curriculumId,
      subjectNodeId: props.subjectNodeId,
      createdAt: new Date(),
    });
  }

  public static reconstitute(
    props: SubjectCurriculumMappingProps,
  ): SubjectCurriculumMapping {
    return new SubjectCurriculumMapping(props);
  }

  public get platformSubjectId(): string {
    return this._platformSubjectId;
  }

  public get curriculumId(): string {
    return this._curriculumId;
  }

  public get subjectNodeId(): string {
    return this._subjectNodeId;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }
}
