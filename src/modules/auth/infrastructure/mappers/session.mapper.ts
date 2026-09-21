import { Injectable } from '@nestjs/common';
import { Session as PrismaSession, SessionStatus as PrismaSessionStatus } from '@generated/prisma/client';
import { IMapper } from '@modules/shared';
import { Session, SessionStatus } from '../../domain';
import { SessionId } from '../../domain/value-objects/session-id.vo';

@Injectable()
export class SessionMapper implements IMapper<Session, PrismaSession> {
  toDomain(record: PrismaSession): Session {
    return Session.reconstitute({
      id: SessionId.from(record.id),
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
