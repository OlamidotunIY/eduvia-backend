import { Injectable } from '@nestjs/common';
import { Session as PrismaSession, SessionStatus as PrismaSessionStatus } from '@prisma/client';
import { Session } from '../../domain/model/Session';
import { SessionStatus } from '../../domain/value-objects/session-stutus.v0';
import { IMapper } from '../../../../shared/repository/prisma-base.repository';

@Injectable()
export class SessionMapper implements IMapper<Session, PrismaSession> {
  toDomain(record: PrismaSession): Session {
    return Session.reconstitute({
      id: record.id,
      authAccountId: record.authAccountId,
      refreshTokenHash: record.refreshTokenHash,
      accessTokenExpiresAt: record.accessTokenExpiresAt,
      refreshTokenExpiresAt: record.refreshTokenExpiresAt,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      sessionStatus: record.sessionStatus as unknown as SessionStatus,
      revokedAt: record.revokedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: Session): Omit<PrismaSession, 'id'> {
    return {
      authAccountId: entity.authAccountId,
      refreshTokenHash: entity.refreshTokenHash,
      accessTokenExpiresAt: entity.accessTokenExpiresAt,
      refreshTokenExpiresAt: entity.refreshTokenExpiresAt,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      sessionStatus: entity.sessionStatus as unknown as PrismaSessionStatus,
      revokedAt: entity.revokedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
