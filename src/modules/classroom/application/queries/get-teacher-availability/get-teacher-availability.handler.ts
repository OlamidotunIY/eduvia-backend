import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTeacherAvailabilityQuery } from './get-teacher-availability.query';
import { TeacherAvailabilityDto } from './get-teacher-availability.dto';
import {
  ITeacherAvailabilityRepository,
  TeacherAvailabilityNotFoundError,
} from '../../../domain';

@QueryHandler(GetTeacherAvailabilityQuery)
export class GetTeacherAvailabilityHandler
  implements IQueryHandler<GetTeacherAvailabilityQuery, TeacherAvailabilityDto>
{
  constructor(
    private readonly availabilityRepository: ITeacherAvailabilityRepository,
  ) {}

  async execute(
    query: GetTeacherAvailabilityQuery,
  ): Promise<TeacherAvailabilityDto> {
    const availability = await this.availabilityRepository.findByTeacherId(
      query.orgId,
      query.teacherId,
    );
    if (!availability) {
      throw new TeacherAvailabilityNotFoundError();
    }

    return {
      id: availability.id.value,
      orgId: availability.orgId,
      teacherId: availability.teacherId,
      slots: availability.slots.map((s) => ({
        id: s.id.value,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        timezone: s.timezone,
      })),
      exceptions: availability.exceptions.map((e) => ({
        id: e.id.value,
        date: e.date,
        type: e.type,
        startTime: e.startTime,
        endTime: e.endTime,
        reason: e.reason,
      })),
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
    };
  }
}
