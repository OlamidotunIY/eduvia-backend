import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { RegistrationRequest } from '../../domain/model/RegistrationRequest';
import { RegistrationRequestId } from '../../domain/value-objects/registration-request-id.vo';
import { RegistrationRequest as PrismaRegistrationRequestRecord } from '@generated/prisma/client';

@Injectable()
export class RegistrationRequestMapper implements IMapper<RegistrationRequest, PrismaRegistrationRequestRecord> {
  toDomain(record: PrismaRegistrationRequestRecord): RegistrationRequest {
    return RegistrationRequest.reconstitute({
      id: RegistrationRequestId.from(record.id),
      email: record.email,
      firstName: record.firstName,
      lastName: record.lastName,
      imageUrl: record.imageUrl,
      emailVerified: record.emailVerified,
      timezone: record.timezone,
      providerId: record.providerId,
      providerAccountId: record.providerAccountId,
      passwordHash: record.passwordHash,
      status: record.status,
      userId: record.userId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: RegistrationRequest): Omit<PrismaRegistrationRequestRecord, 'id'> {
    return {
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      imageUrl: entity.imageUrl,
      emailVerified: entity.emailVerified,
      timezone: entity.timezone,
      providerId: entity.providerId,
      providerAccountId: entity.providerAccountId,
      passwordHash: entity.passwordHash,
      status: entity.status,
      userId: entity.userId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
