import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SetTeacherAvailabilityCommand } from './set-teacher-availability.command';
import {
  AvailabilitySlot,
  ITeacherAvailabilityRepository,
  TeacherAvailability,
} from '../../../domain';

@CommandHandler(SetTeacherAvailabilityCommand)
export class SetTeacherAvailabilityHandler
  implements ICommandHandler<SetTeacherAvailabilityCommand, { id: string }>
{
  constructor(
    private readonly availabilityRepository: ITeacherAvailabilityRepository,
  ) {}

  async execute(command: SetTeacherAvailabilityCommand): Promise<{ id: string }> {
    const { payload } = command;
    let availability = await this.availabilityRepository.findByTeacherId(
      payload.orgId,
      payload.teacherId,
    );

    const domainSlots = payload.slots.map((s) =>
      AvailabilitySlot.create({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        timezone: s.timezone,
      }),
    );

    if (!availability) {
      availability = TeacherAvailability.create({
        orgId: payload.orgId,
        teacherId: payload.teacherId,
        slots: domainSlots,
      });
    } else {
      availability.setSlots(domainSlots);
    }

    await this.availabilityRepository.save(availability);

    return { id: availability.id.value };
  }
}
