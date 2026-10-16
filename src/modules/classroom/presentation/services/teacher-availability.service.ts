import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  SetTeacherAvailabilityCommand,
  AddAvailabilityExceptionCommand,
  RemoveAvailabilityExceptionCommand,
} from '../../application/commands';
import {
  GetTeacherAvailabilityQuery,
  GetAvailableSlotsQuery,
  TeacherAvailabilityDto,
} from '../../application/queries';
import {
  SetTeacherAvailabilityDto,
  AddAvailabilityExceptionDto,
} from '../dto';

@Injectable()
export class TeacherAvailabilityService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async getAvailability(
    orgId: string,
    teacherId: string,
  ): Promise<TeacherAvailabilityDto> {
    return this.queryBus.execute(
      new GetTeacherAvailabilityQuery(orgId, teacherId),
    );
  }

  async setAvailability(
    orgId: string,
    teacherId: string,
    dto: SetTeacherAvailabilityDto,
  ): Promise<{ id: string }> {
    return this.commandBus.execute(
      new SetTeacherAvailabilityCommand({
        orgId,
        teacherId,
        slots: dto.slots,
      }),
    );
  }

  async addException(
    orgId: string,
    teacherId: string,
    dto: AddAvailabilityExceptionDto,
  ): Promise<{ id: string }> {
    return this.commandBus.execute(
      new AddAvailabilityExceptionCommand({
        orgId,
        teacherId,
        date: new Date(dto.date),
        type: dto.type,
        startTime: dto.startTime,
        endTime: dto.endTime,
        reason: dto.reason,
      }),
    );
  }

  async removeException(
    orgId: string,
    teacherId: string,
    exceptionId: string,
  ): Promise<{ success: boolean }> {
    return this.commandBus.execute(
      new RemoveAvailabilityExceptionCommand({
        orgId,
        teacherId,
        exceptionId,
      }),
    );
  }

  async getAvailableSlots(
    orgId: string,
    teacherId: string,
    startDate: Date,
    endDate: Date,
    durationMins = 60,
  ): Promise<Date[]> {
    return this.queryBus.execute(
      new GetAvailableSlotsQuery(
        orgId,
        teacherId,
        startDate,
        endDate,
        durationMins,
      ),
    );
  }
}
