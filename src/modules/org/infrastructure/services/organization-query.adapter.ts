import { Injectable } from '@nestjs/common';
import {
  IOrganizationQueryPort,
  OrganizationMembershipDTO,
  OrganizationSummaryDTO,
  SharedOrganizationSubjectDTO,
  UserOrganizationDTO,
} from '@modules/shared';
import { OrganizationId } from '../../domain/value-objects';
import {
  IOrganizationMembershipRepository,
  IOrganizationRepository,
  IOrganizationSubjectRepository,
} from '../../domain/repository';

@Injectable()
export class OrganizationQueryAdapter implements IOrganizationQueryPort {
  constructor(
    private readonly orgRepository: IOrganizationRepository,
    private readonly membershipRepository: IOrganizationMembershipRepository,
    private readonly orgSubjectRepository: IOrganizationSubjectRepository,
  ) {}

  async getOrganizationById(
    id: string,
  ): Promise<OrganizationSummaryDTO | null> {
    try {
      const org = await this.orgRepository.findById(OrganizationId.from(id));
      if (!org) return null;
      return {
        id: org.getId(),
        ownerId: org.ownerId,
        name: org.name,
        slug: org.slug,
        status: org.status,
        country: org.country,
        marketplaceListed: org.marketplaceListed,
      };
    } catch {
      return null;
    }
  }

  async getOrganizationBySlug(
    slug: string,
  ): Promise<OrganizationSummaryDTO | null> {
    const org = await this.orgRepository.findBySlug(slug);
    if (!org) return null;
    return {
      id: org.getId(),
      ownerId: org.ownerId,
      name: org.name,
      slug: org.slug,
      status: org.status,
      country: org.country,
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

  async getOrganizationsForUser(
    userId: string,
  ): Promise<UserOrganizationDTO[]> {
    const memberships = await this.membershipRepository.findByUserId(userId);
    const activeMemberships = memberships.filter((membership) =>
      membership.isActive(),
    );
    const organizations = await Promise.all(
      activeMemberships.map(async (membership) => {
        const [organization, organizationMembers] = await Promise.all([
          this.orgRepository.findById(membership.orgId),
          this.membershipRepository.findByOrganizationId(membership.orgId),
        ]);
        if (!organization) return null;
        return {
          organization: {
            id: organization.getId(),
            ownerId: organization.ownerId,
            name: organization.name,
            slug: organization.slug,
            status: organization.status,
            country: organization.country,
            marketplaceListed: organization.marketplaceListed,
          },
          membership: {
            id: membership.id.value,
            orgId: membership.orgId.value,
            userId: membership.userId,
            role: membership.role,
            status: membership.status,
            subjects: membership.subjects,
          },
          memberCount: organizationMembers.filter((member) => member.isActive())
            .length,
        };
      }),
    );
    return organizations.filter(
      (item): item is UserOrganizationDTO => item !== null,
    );
  }

  async getActiveAdminUserIds(orgId: string): Promise<string[]> {
    const memberships =
      await this.membershipRepository.findByOrganizationId(orgId);
    return memberships
      .filter((membership) => membership.isActive() && membership.isAdmin())
      .map((membership) => membership.userId);
  }

  async getActiveMemberUserIds(orgId: string): Promise<string[]> {
    const memberships =
      await this.membershipRepository.findByOrganizationId(orgId);
    return memberships
      .filter((membership) => membership.isActive())
      .map((membership) => membership.userId);
  }

  async isOrgActive(id: string): Promise<boolean> {
    try {
      const org = await this.orgRepository.findById(OrganizationId.from(id));
      return org !== null && org.isActive();
    } catch {
      return false;
    }
  }

  async getOrganizationSubjects(
    orgId: string,
    activeOnly = true,
  ): Promise<SharedOrganizationSubjectDTO[]> {
    const subjects = activeOnly
      ? await this.orgSubjectRepository.findActiveSubjectsByOrganizationId(
          orgId,
        )
      : await this.orgSubjectRepository.findByOrganizationId(orgId);

    return subjects.map((s) => ({
      id: s.getId(),
      orgId: s.orgId.toString(),
      name: s.name,
      platformSubjectId: s.platformSubjectId,
      description: s.description,
      isActive: s.isActive,
    }));
  }
}
