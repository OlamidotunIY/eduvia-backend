import { Command } from '@nestjs/cqrs';
import { UpdateOrganizationProfileResult } from './update-org-profile.result';

export class UpdateOrganizationProfileCommand extends Command<UpdateOrganizationProfileResult> {
  constructor(
    public readonly payload: {
      orgId: string;
      callerUserId: string;
      name?: string;
      description?: string | null;
      logoUrl?: string | null;
      websiteUrl?: string | null;
      contactEmail?: string;
      contactPhone?: string | null;
      country?: string;
      timezone?: string;
      correlationId: string;
    },
  ) {
    super();
  }
}
