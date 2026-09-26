import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { Organization, OrganizationId, OrganizationStatus, OrganizationSubjectId } from '../../domain';
import {
  
  Organization as PrismaOrganization,
} from '@generated/prisma/client';
import { OrganizationPolicy } from '../../domain/entities/org.policy.entity';

@Injectable()
export class OrganizationMapper implements IMapper<
  Organization,
  PrismaOrganization
> {
  toDomain(record: PrismaOrganization): Organization {
    return Organization.reconstitute({
      name: record.name,
      id: OrganizationId.from(record.id),
      ownerId: record.ownerId,
      slug: record.slug,
      description: record.description,
      logoUrl: record.logoUrl,
      websiteUrl: record.websiteUrl,
      contactEmail: record.contactEmail,
      contactPhone: record.contactPhone,
      country: record.country,
      timezone: record.timezone,
      status: record.status as OrganizationStatus,
      marketplaceListed: record.marketplaceListed,
      acceptingTeachers: record.acceptingTeachers,
      acceptingTeachersFor: record.acceptingTeachersFor.map((id)=> (
        OrganizationSubjectId.from(id)
      )),
      policy: new OrganizationPolicy({

      }),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: Organization): Omit<PrismaOrganization, 'id'> {
   return{
     name: entity.name,
    ownerId: entity.ownerId,
    slug: entity.slug,
    description: entity.description,
    logoUrl: entity.logoUrl,
    websiteUrl: entity.websiteUrl,
    contactEmail: entity.contactEmail,
    contactPhone: entity.contactPhone,
    country: entity.country,
    timezone: entity.timezone,
    status: entity.status,
    marketplaceListed: entity.marketplaceListed,
    acceptingTeachers: entity.acceptingTeachers,
    acceptingTeachersFor: entity.acceptingTeachersFor.map((id) =>(id.toString())),
    autoRescheduleOnNoShow: entity.policy.autoRescheduleOnNoShow,
    cancellationWindowHours: entity.policy.cancellationWindowHours,
    lessonPlanRequired: entity.policy.lessonPlanRequired,
    noShowWaitMinutes: entity.policy.noShowWaitMinutes,
    reportRequiredWithinHours: entity.policy.noShowWaitMinutes,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt
   }
  }
}
