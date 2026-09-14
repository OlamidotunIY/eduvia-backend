import { Injectable } from '@nestjs/common';
import {
  Verification as PrismaVerification,
  VerificationStatus as PrismaVerificationStatus,
  VerificationType as PrismaVerificationType,
} from '@generated/prisma';
import { Verification } from '../../domain/model/Verification';
import { VerificationStatus } from '../../domain/value-objects/verification-status.v0';
import { VerificationType } from '../../domain/value-objects/verification-type.v0';
import { IMapper } from '../../../../shared/repository/prisma-base.repository';

@Injectable()
export class VerificationMapper implements IMapper<Verification, PrismaVerification> {
  toDomain(record: PrismaVerification): Verification {
    return Verification.reconstitute({
      id: record.id,
      authAccountId: record.authAccountId,
      identifier: record.identifier,
      valueHash: record.valueHash,
      verificationType: record.verificationType as unknown as VerificationType,
      verificationStatus: record.verificationStatus as unknown as VerificationStatus,
      expiresAt: record.expiresAt,
      attempts: record.attempts,
      maxAttempts: record.maxAttempts,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: Verification): Omit<PrismaVerification, 'id'> {
    return {
      authAccountId: entity.authAccountId,
      identifier: entity.identifier,
      valueHash: entity.valueHash,
      verificationType: entity.verificationType as unknown as PrismaVerificationType,
      verificationStatus: entity.verificationStatus as unknown as PrismaVerificationStatus,
      expiresAt: entity.expiresAt,
      attempts: entity.attempts,
      maxAttempts: entity.maxAttempts,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
