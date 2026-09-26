import { Injectable } from '@nestjs/common';
import { OrganizationInvitation } from '../../domain/entities';
import {
  InvitationRole,
  InvitationStatus,
  OrganizationInvitationId,
} from '../../domain';
import { OrganizationInvitation as PrismaOrganizationInvitation } from '@generated/prisma/client';

@Injectable()
export class OrganizationInvitationMapper {
  toDomain(record: PrismaOrganizationInvitation): OrganizationInvitation {
    return OrganizationInvitation.reconstitute({
      id: OrganizationInvitationId.from(record.id),
      orgId: record.orgId,
      inviterUserId: record.inviterUserId,
      inviteeEmail: record.inviteeEmail,
      role: record.role as InvitationRole,
      subjects: record.subjects,
      tokenHash: record.tokenHash,
      status: record.status as InvitationStatus,
      expiresAt: record.expiresAt,
      acceptedAt: record.acceptedAt,
      createdAt: record.createdAt,
    });
  }

  toPersistence(
    entity: OrganizationInvitation,
  ): Omit<PrismaOrganizationInvitation, 'id'> {
    return {
      orgId: entity.orgId,
      inviterUserId: entity.inviterUserId,
      inviteeEmail: entity.inviteeEmail,
      role: entity.role as InvitationRole,
      subjects: entity.subjects,
      tokenHash: entity.tokenHash,
      status: entity.status as InvitationStatus,
      expiresAt: entity.expiresAt,
      acceptedAt: entity.acceptedAt,
      createdAt: entity.createdAt,
    };
  }
}
