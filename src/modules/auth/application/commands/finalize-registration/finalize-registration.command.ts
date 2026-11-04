import { Command } from '@nestjs/cqrs';
import { FinalizeRegistrationPayload, FinalizeRegistrationResult } from './finalize-registration.result';

export class FinalizeRegistrationCommand extends Command<FinalizeRegistrationResult> {
  constructor(public readonly payload: FinalizeRegistrationPayload) {
    super();
  }
}
