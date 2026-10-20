import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddAvailabilityExceptionCommand } from './add-availability-exception.command';
import {
  AvailabilityException,
  ITeacherAvailabilityRepository,
  TeacherAvailability,
} from '../../../domain';

@CommandHandler(AddAvailabilityExceptionCommand)
export class AddAvailabilityExceptionHandler
  implements ICommandHandler<AddAvailabilityExceptionCommand, { id: string }>
{
  constructor(
    private readonly availabilityRepository: ITeacherAvailabilityRepository,
  ) {}

  async execute(command: AddAvailabilityExceptionCommand): Promise<{ id: string }> {
    const { payload } = command;
    let availability = await this.availabilityRepository.findByTeacherId(
      payload.orgId,
      payload.teacherId,
    );

    if (!availability) {
      availability = TeacherAvailability.create({
        orgId: payload.orgId,
        teacherId: payload.teacherId,
      });
    }

    const exception = AvailabilityException.create({
      date: payload.date,
      type: payload.type,
      startTime: payload.startTime,
      endTime: payload.endTime,
      reason: payload.reason,
    });

    availability.addException(exception);
    await this.availabilityRepository.save(availability);

    return { id: exception.id.value };
  }
}
