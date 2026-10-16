import { Injectable } from '@nestjs/common';
import {
  IOrganizationQueryPort,
  OrganizationMembershipDTO,
  OrganizationSummaryDTO,
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

  async isOrgActive(id: string): Promise<boolean> {
    try {
      const org = await this.orgRepository.findById(OrganizationId.from(id));
      return org !== null && org.isActive();
    } catch {
      return false;
    }
  }
}
