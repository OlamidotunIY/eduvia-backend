import { Injectable } from '@nestjs/common';
import { OrganizationMembership } from '../../domain/entities';
import { MembershipStatus, OrganizationId, OrganizationMembershipId, OrganizationRole } from '../../domain';
import { OrganizationMembership as PrismaOrganizationMembership } from '@generated/prisma/client';

@Injectable()
export class OrganizationMembershipMapper {
  toDomain(record: PrismaOrganizationMembership): OrganizationMembership {
    return OrganizationMembership.reconstitute({
      id: OrganizationMembershipId.from(record.id),
      orgId: OrganizationId.from(record.orgId),
      userId: record.userId,
      role: record.role as OrganizationRole,
      subjects: record.subjects,
      status: record.status as MembershipStatus,
      joinedAt: record.joinedAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(
    entity: OrganizationMembership,
  ): Omit<PrismaOrganizationMembership, 'id'> {
    return {
      orgId: entity.orgId.value,
      userId: entity.userId,
      role: entity.role as OrganizationRole,
      subjects: entity.subjects,
      status: entity.status as MembershipStatus,
      joinedAt: entity.joinedAt,
      updatedAt: entity.updatedAt,
    };
  }
}
