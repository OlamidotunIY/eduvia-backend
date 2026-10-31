import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Optional } from '@nestjs/common';
import { UserGateway } from '@modules/websocket';
import { CreatePendingRegistrationCommand, MarkEmailVerifiedCommand, SetActiveOrganizationCommand, SuspendUserCommand } from '../../../application/commands';
import { AccountSuspendedEvent, AuthEmailVerifiedEvent, InitialActiveOrganizationRequestedEvent, UserActiveOrganizationChangedEvent, UserRegistrationRequestedEvent } from '../events';

@Processor('user-events')
export class UserEventProcessor extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    @Optional() private readonly userGateway?: UserGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === UserActiveOrganizationChangedEvent.eventName) {
      const payload = job.data.payload as UserActiveOrganizationChangedEvent['payload'];
      const result = await this.commandBus.execute(new SetActiveOrganizationCommand({
        ...payload,
        correlationId: job.data.correlationId,
      }));
      if (result.changed) {
        this.userGateway?.activeOrganizationChanged(
          payload.userId,
          payload.organizationId,
        );
      }
      return;
    }
    if (job.name === InitialActiveOrganizationRequestedEvent.eventName) {
      const payload = job.data.payload as InitialActiveOrganizationRequestedEvent['payload'];
      const result = await this.commandBus.execute(
        new SetActiveOrganizationCommand({
          ...payload,
          correlationId: job.data.correlationId,
          onlyIfUnset: true,
        }),
      );
      if (result.changed) {
        this.userGateway?.activeOrganizationChanged(
          payload.userId,
          payload.organizationId,
        );
      }
      return;
    }
    if (job.name === UserRegistrationRequestedEvent.eventName) {
      const payload = job.data.payload as UserRegistrationRequestedEvent['payload'];
      await this.commandBus.execute(
        new CreatePendingRegistrationCommand({
          ...payload,
          correlationId: job.data.correlationId,
        }),
      );
      return;
    }

    if (job.name === AuthEmailVerifiedEvent.eventName) {
      const payload = job.data.payload as AuthEmailVerifiedEvent['payload'];
      await this.commandBus.execute(
        new MarkEmailVerifiedCommand({ userId: payload.userId }),
      );
      return;
    }

    if (job.name === AccountSuspendedEvent.eventName) {
      const payload = job.data.payload as AccountSuspendedEvent['payload'];
      await this.commandBus.execute(
        new SuspendUserCommand({ userId: payload.userId }),
      );
    }
  }
}
