import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveAvailabilityExceptionCommand } from './remove-availability-exception.command';
import {
  AvailabilityExceptionId,
  ITeacherAvailabilityRepository,
  TeacherAvailabilityNotFoundError,
} from '../../../domain';

@CommandHandler(RemoveAvailabilityExceptionCommand)
export class RemoveAvailabilityExceptionHandler
  implements
    ICommandHandler<RemoveAvailabilityExceptionCommand, { success: boolean }>
{
  constructor(
    private readonly availabilityRepository: ITeacherAvailabilityRepository,
  ) {}

  async execute(
    command: RemoveAvailabilityExceptionCommand,
  ): Promise<{ success: boolean }> {
    const { payload } = command;
    const availability = await this.availabilityRepository.findByTeacherId(
      payload.orgId,
      payload.teacherId,
    );

    if (!availability) {
      throw new TeacherAvailabilityNotFoundError();
    }

    availability.removeException(
      AvailabilityExceptionId.from(payload.exceptionId),
    );
    await this.availabilityRepository.save(availability);

    return { success: true };
  }
}
