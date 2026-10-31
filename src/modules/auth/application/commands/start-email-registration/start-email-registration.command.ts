import { Command } from '@nestjs/cqrs';
import { StartEmailRegistrationPayload, StartEmailRegistrationResult } from './start-email-registration.result';

export class StartEmailRegistrationCommand extends Command<StartEmailRegistrationResult> {
  constructor(public readonly payload: StartEmailRegistrationPayload) {
    super();
  }
}
