import { Command } from '@nestjs/cqrs';
import { CreateOrganizationResult } from './create-organization.result';

export class CreateOrganizationCommand extends Command<CreateOrganizationResult> {
  constructor(
    public readonly payload: {
      ownerId: string;
      name: string;
      slug: string;
      contactEmail: string;
      country: string;
      timezone: string;
      logoUrl?: string | null;
      websiteUrl?: string | null;
      correlationId: string;
    },
  ) {
    super();
  }
}
