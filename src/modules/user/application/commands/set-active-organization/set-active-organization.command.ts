import { Command } from '@nestjs/cqrs';
import { SetActiveOrganizationPayload, SetActiveOrganizationResult } from './set-active-organization.result';

export class SetActiveOrganizationCommand extends Command<SetActiveOrganizationResult> {
  constructor(public readonly payload: SetActiveOrganizationPayload) {
    super();
  }
}
