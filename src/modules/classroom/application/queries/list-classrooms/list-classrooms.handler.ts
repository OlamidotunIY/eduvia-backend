import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListClassroomsQuery } from './list-classrooms.query';
import { ClassroomDto } from '../get-classroom-by-id/get-classroom-by-id.dto';
import { IClassroomRepository } from '../../../domain';

@QueryHandler(ListClassroomsQuery)
export class ListClassroomsHandler
  implements IQueryHandler<ListClassroomsQuery, ClassroomDto[]>
{
  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(query: ListClassroomsQuery): Promise<ClassroomDto[]> {
    const classrooms = query.teacherId
      ? await this.classroomRepository.findByTeacherId(query.orgId, query.teacherId)
      : await this.classroomRepository.findByOrgId(query.orgId);

    return classrooms.map((classroom) => ({
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
    }));
  }
}
