import { Command } from '@nestjs/cqrs';
import {
  CreateOrganizationResult,
} from './create-organization.result';

export class CreateOrganizationCommand extends Command<CreateOrganizationResult> {
  constructor(
    public readonly payload: {
      ownerId: string;
      name: string;
      slug: string;
      contactEmail: string,
      correlationId: string;
    },
  ) {
    super();
  }
}
