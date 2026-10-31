import { Injectable } from '@nestjs/common';
import {
  IOrganizationQueryPort,
  OrganizationMembershipDTO,
  OrganizationSummaryDTO,
  UserOrganizationDTO,
} from '@modules/shared';
import { OrganizationId } from '../../domain/value-objects';
import {
  IOrganizationMembershipRepository,
  IOrganizationRepository,
} from '../../domain/repository';

@Injectable()
export class OrganizationQueryAdapter implements IOrganizationQueryPort {
  constructor(
    private readonly orgRepository: IOrganizationRepository,
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async getOrganizationById(id: string): Promise<OrganizationSummaryDTO | null> {
    try {
      const org = await this.orgRepository.findById(OrganizationId.from(id));
      if (!org) return null;
      return {
        id: org.getId(),
        ownerId: org.ownerId,
        name: org.name,
        slug: org.slug,
        status: org.status,
        marketplaceListed: org.marketplaceListed,
      };
    } catch {
      return null;
    }
  }

  async getOrganizationBySlug(slug: string): Promise<OrganizationSummaryDTO | null> {
    const org = await this.orgRepository.findBySlug(slug);
    if (!org) return null;
    return {
      id: org.getId(),
      ownerId: org.ownerId,
      name: org.name,
      slug: org.slug,
      status: org.status,
      marketplaceListed: org.marketplaceListed,
    };
  }

  async getMembership(
    orgId: string,
    userId: string,
  ): Promise<OrganizationMembershipDTO | null> {
    const membership = await this.membershipRepository.findByOrgIdAndUserId(
      orgId,
      userId,
    );
    if (!membership) return null;
    return {
      id: membership.id.value,
      orgId: membership.orgId.value,
      userId: membership.userId,
      role: membership.role,
      status: membership.status,
      subjects: membership.subjects,
    };
  }

  async isMember(orgId: string, userId: string): Promise<boolean> {
    const membership = await this.membershipRepository.findByOrgIdAndUserId(
      orgId,
      userId,
    );
    return membership !== null && membership.isActive();
  }

  async getOrganizationsForUser(userId: string): Promise<UserOrganizationDTO[]> {
    const memberships = await this.membershipRepository.findByUserId(userId);
    const activeMemberships = memberships.filter((membership) => membership.isActive());
    const organizations = await Promise.all(activeMemberships.map(async (membership) => {
      const [organization, organizationMembers] = await Promise.all([
        this.orgRepository.findById(membership.orgId),
        this.membershipRepository.findByOrganizationId(membership.orgId),
      ]);
      if (!organization) return null;
      return {
        organization: {
          id: organization.getId(), ownerId: organization.ownerId, name: organization.name,
          slug: organization.slug, status: organization.status,
          marketplaceListed: organization.marketplaceListed,
        },
        membership: {
          id: membership.id.value, orgId: membership.orgId.value, userId: membership.userId,
          role: membership.role, status: membership.status, subjects: membership.subjects,
        },
        memberCount: organizationMembers.filter((member) => member.isActive()).length,
      };
    }));
    return organizations.filter((item): item is UserOrganizationDTO => item !== null);
  }

  async isOrgActive(id: string): Promise<boolean> {
    try {
      const org = await this.orgRepository.findById(OrganizationId.from(id));
      return org !== null && org.isActive();
    } catch {
      return false;
    }
  }
}
