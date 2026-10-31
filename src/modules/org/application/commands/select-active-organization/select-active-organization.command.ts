import { Command } from '@nestjs/cqrs';
import { SelectActiveOrganizationPayload, SelectActiveOrganizationResult } from './select-active-organization.result';

export class SelectActiveOrganizationCommand extends Command<SelectActiveOrganizationResult> {
  constructor(public readonly payload: SelectActiveOrganizationPayload) {
    super();
  }
}
