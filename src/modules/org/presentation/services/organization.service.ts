import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateOrganizationDTO } from '../dto';
import { CreateOrganizationCommand } from '../../application/commands/create-organization';
import { ReceiveTeacherApplicationDTO } from '../dto/receive-teacher-application.dto';
import { ReceiveTeacherApplicationCommand } from '../../application/commands/receive-teacher-application';

@Injectable()
export class OrganizationService {
  constructor(private readonly commandBus: CommandBus) {}

  async createOrganization(dto: CreateOrganizationDTO, ownerId: string, correlationId: string) {
    return this.commandBus.execute(
      new CreateOrganizationCommand({
        ownerId,
        name: dto.name,
        slug: dto.slug,
        contactEmail: dto.contactEmail,
        country: dto.country,
        timezone: dto.timezone,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
        correlationId,
      }),
    );
  }

  async applyToOrganization(
    organizationId: string,
    userId: string,
    dto: ReceiveTeacherApplicationDTO,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new ReceiveTeacherApplicationCommand({
        orgId: organizationId,
        applicantUserId: userId,
        appliedSubjects: dto.appliedSubjects,
        coverLetter: dto.coverLetter,
        qualifications: dto.qualifications,
        correlationId,
      }),
    );
  }
}
