import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAvailableSlotsQuery } from './get-available-slots.query';
import {
  ITeacherAvailabilityRepository,
  ILessonRepository,
  TeacherAvailabilityNotFoundError,
} from '../../../domain';

@QueryHandler(GetAvailableSlotsQuery)
export class GetAvailableSlotsHandler
  implements IQueryHandler<GetAvailableSlotsQuery, Date[]>
{
  constructor(
    private readonly availabilityRepository: ITeacherAvailabilityRepository,
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute(query: GetAvailableSlotsQuery): Promise<Date[]> {
    const availability = await this.availabilityRepository.findByTeacherId(
      query.orgId,
      query.teacherId,
    );
    if (!availability) {
      throw new TeacherAvailabilityNotFoundError();
    }

    const rawSlots = availability.getAvailableSlots(
      query.startDate,
      query.endDate,
      query.durationMins,
    );

    // Filter out slots that conflict with already scheduled lessons
    const validSlots: Date[] = [];
    for (const slot of rawSlots) {
      const conflicts = await this.lessonRepository.findConflictingLessons(
        query.orgId,
        query.teacherId,
        slot,
        query.durationMins,
      );
      if (conflicts.length === 0) {
        validSlots.push(slot);
      }
    }

    return validSlots;
  }
}
