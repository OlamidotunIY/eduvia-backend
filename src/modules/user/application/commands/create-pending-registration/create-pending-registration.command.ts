import { Command } from '@nestjs/cqrs';
import { CreatePendingRegistrationPayload, CreatePendingRegistrationResult } from './create-pending-registration.result';

export class CreatePendingRegistrationCommand extends Command<CreatePendingRegistrationResult> {
  constructor(public readonly payload: CreatePendingRegistrationPayload) {
    super();
  }
}
