import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClassroomByIdQuery } from './get-classroom-by-id.query';
import { ClassroomDto } from './get-classroom-by-id.dto';
import { ClassroomNotFoundError, IClassroomRepository } from '../../../domain';

@QueryHandler(GetClassroomByIdQuery)
export class GetClassroomByIdHandler
  implements IQueryHandler<GetClassroomByIdQuery, ClassroomDto>
{
  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(query: GetClassroomByIdQuery): Promise<ClassroomDto> {
    const classroom = await this.classroomRepository.findById(query.classroomId);
    if (!classroom || classroom.orgId !== query.orgId) {
      throw new ClassroomNotFoundError();
    }

    return {
      id: classroom.id.value,
      orgId: classroom.orgId,
      name: classroom.name,
      subjectId: classroom.subjectId,
      primaryTeacherId: classroom.primaryTeacherId,
      status: classroom.status,
      lessonDurationMins: classroom.lessonDurationMins,
      maxStudents: classroom.maxStudents,
      recurrence: {
        dayOfWeek: classroom.recurrence.dayOfWeek,
        startTime: classroom.recurrence.startTime,
        timezone: classroom.recurrence.timezone,
        intervalWeeks: classroom.recurrence.intervalWeeks,
        effectiveFrom: classroom.recurrence.effectiveFrom,
        effectiveUntil: classroom.recurrence.effectiveUntil,
      },
      createdAt: classroom.createdAt,
      updatedAt: classroom.updatedAt,
    };
  }
}
