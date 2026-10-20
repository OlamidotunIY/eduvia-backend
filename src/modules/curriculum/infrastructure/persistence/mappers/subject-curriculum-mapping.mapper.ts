import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  SubjectCurriculumMapping,
  SubjectCurriculumMappingId,
} from '../../../domain';
import { SubjectCurriculumMapping as PrismaSubjectCurriculumMapping } from '@generated/prisma/client';

@Injectable()
export class SubjectCurriculumMappingMapper implements IMapper<SubjectCurriculumMapping, PrismaSubjectCurriculumMapping> {
  public toDomain(record: PrismaSubjectCurriculumMapping): SubjectCurriculumMapping {
    return SubjectCurriculumMapping.reconstitute({
      id: SubjectCurriculumMappingId.from(record.id),
      platformSubjectId: record.platformSubjectId,
      curriculumId: record.curriculumId,
      subjectNodeId: record.subjectNodeId,
      createdAt: record.createdAt,
    });
  }

  public toPersistence(entity: SubjectCurriculumMapping): Omit<PrismaSubjectCurriculumMapping, 'id'> {
    return {
      platformSubjectId: entity.platformSubjectId,
      curriculumId: entity.curriculumId,
      subjectNodeId: entity.subjectNodeId,
      createdAt: entity.createdAt,
    };
  }
}
