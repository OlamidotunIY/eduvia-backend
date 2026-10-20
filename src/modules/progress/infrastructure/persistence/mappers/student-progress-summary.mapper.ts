import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  StudentProgressSummary,
  StudentProgressSummaryId,
} from '../../../domain';
import { StudentProgressSummary as PrismaStudentProgressSummary } from '@generated/prisma/client';

@Injectable()
export class StudentProgressSummaryMapper
  implements IMapper<StudentProgressSummary, PrismaStudentProgressSummary>
{
  toDomain(record: PrismaStudentProgressSummary): StudentProgressSummary {
    return StudentProgressSummary.reconstitute({
      id: StudentProgressSummaryId.from(record.id),
      studentId: record.studentId,
      orgId: record.orgId,
      subjectId: record.subjectId,
      totalLessonsAttended: record.totalLessonsAttended,
      totalLessonsMissed: record.totalLessonsMissed,
      totalAssessments: record.totalAssessments,
      averageScorePercent: record.averageScorePercent,
      masteredTopicsCount: record.masteredTopicsCount,
      inProgressTopicsCount: record.inProgressTopicsCount,
      notStartedTopicsCount: record.notStartedTopicsCount,
      overallMasteryLevel: record.overallMasteryLevel,
      lastLessonAt: record.lastLessonAt,
      lastUpdatedAt: record.lastUpdatedAt,
    });
  }

  toPersistence(
    entity: StudentProgressSummary,
  ): Omit<PrismaStudentProgressSummary, 'id'> {
    return {
      studentId: entity.studentId,
      orgId: entity.orgId,
      subjectId: entity.subjectId,
      totalLessonsAttended: entity.totalLessonsAttended,
      totalLessonsMissed: entity.totalLessonsMissed,
      totalAssessments: entity.totalAssessments,
      averageScorePercent: entity.averageScorePercent,
      masteredTopicsCount: entity.masteredTopicsCount,
      inProgressTopicsCount: entity.inProgressTopicsCount,
      notStartedTopicsCount: entity.notStartedTopicsCount,
      overallMasteryLevel: entity.overallMasteryLevel,
      lastLessonAt: entity.lastLessonAt,
      lastUpdatedAt: entity.lastUpdatedAt,
    };
  }
}
