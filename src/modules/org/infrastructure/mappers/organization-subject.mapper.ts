import { Injectable } from '@nestjs/common';
import { OrganizationSubject } from '../../domain/entities';
import { Organization, OrganizationSubjectId } from '../../domain';
import { OrganizationSubject as PrismaOrganizationSubject } from '@generated/prisma/client';

@Injectable()
export class OrganizationSubjectMapper {
  toDomain(record: PrismaOrganizationSubject): OrganizationSubject {
    return OrganizationSubject.reconstitute({
      id: OrganizationSubjectId.from(record.id),
      orgId: record.orgId,
      name: record.name,
      platformSubjectId: record.platformSubjectId,
      description: record.description,
      isActive: record.isActive,
      createdAt: record.createdAt,
    });
  }

  toPersistence(
    entity: OrganizationSubject,
  ): Omit<PrismaOrganizationSubject, 'id'> {
    return {
      orgId: entity.orgId,
      name: entity.name,
      platformSubjectId: entity.platformSubjectId,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    };
  }
}
