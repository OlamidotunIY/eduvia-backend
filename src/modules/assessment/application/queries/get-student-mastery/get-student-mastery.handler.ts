import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStudentMasteryQuery } from './get-student-mastery.query';
import { StudentMasteryDto } from './get-student-mastery.dto';
import { IMasteryRecordRepository } from '../../../domain';

@QueryHandler(GetStudentMasteryQuery)
export class GetStudentMasteryHandler
  implements IQueryHandler<GetStudentMasteryQuery, StudentMasteryDto[]>
{
  constructor(
    private readonly masteryRecordRepository: IMasteryRecordRepository,
  ) {}

  async execute(query: GetStudentMasteryQuery): Promise<StudentMasteryDto[]> {
    if (query.curriculumNodeId && query.orgId) {
      const single = await this.masteryRecordRepository.findByStudentAndNode(
        query.studentId,
        query.curriculumNodeId,
        query.orgId,
      );
      if (!single) return [];
      return [this.mapToDto(single)];
    }

    const records = await this.masteryRecordRepository.findByStudentId(
      query.studentId,
      query.orgId,
    );

    return records.map((r) => this.mapToDto(r));
  }

  private mapToDto(record: any): StudentMasteryDto {
    return {
      id: record.id.unpack(),
      studentId: record.studentId,
      curriculumNodeId: record.curriculumNodeId,
      orgId: record.orgId,
      masteryLevel: record.masteryLevel,
      teacherAssessedScore: record.teacherAssessedScore,
      systemCalculatedScore: record.systemCalculatedScore,
      assessmentCount: record.assessmentCount,
      lastUpdatedAt: record.lastUpdatedAt,
      history: record.history.map((h: any) => ({
        id: h.id.unpack(),
        masteryRecordId: h.masteryRecordId,
        masteryLevel: h.masteryLevel,
        trigger: h.trigger,
        lessonId: h.lessonId,
        recordedAt: h.recordedAt,
      })),
    };
  }
}
