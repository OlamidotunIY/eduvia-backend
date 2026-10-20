import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStudentProgressQuery } from './get-student-progress.query';
import { StudentProgressSummaryDto } from './student-progress.dto';
import { IStudentProgressSummaryRepository } from '../../../domain';

@QueryHandler(GetStudentProgressQuery)
export class GetStudentProgressHandler
  implements IQueryHandler<GetStudentProgressQuery, StudentProgressSummaryDto[]>
{
  constructor(
    private readonly summaryRepository: IStudentProgressSummaryRepository,
  ) {}

  async execute(
    query: GetStudentProgressQuery,
  ): Promise<StudentProgressSummaryDto[]> {
    if (query.subjectId && query.orgId) {
      const single = await this.summaryRepository.findByStudentAndSubject(
        query.studentId,
        query.orgId,
        query.subjectId,
      );
      return single ? [this.toDto(single)] : [];
    }

    const summaries = await this.summaryRepository.findAllByStudent(
      query.studentId,
      query.orgId,
    );
    return summaries.map((s) => this.toDto(s));
  }

  private toDto(entity: any): StudentProgressSummaryDto {
    return {
      id: entity.id.unpack(),
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
