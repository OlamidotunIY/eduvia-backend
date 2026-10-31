import { Command } from '@nestjs/cqrs';
import { CompleteUserOnboardingPayload, CompleteUserOnboardingResult } from './complete-user-onboarding.result';

export class CompleteUserOnboardingCommand extends Command<CompleteUserOnboardingResult> {
  constructor(public readonly payload: CompleteUserOnboardingPayload) {
    super();
  }
}
