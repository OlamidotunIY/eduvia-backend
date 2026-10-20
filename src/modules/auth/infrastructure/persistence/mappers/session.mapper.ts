import { Injectable } from '@nestjs/common';
import { Session as PrismaSession } from '@generated/prisma/client';
import { IMapper } from '@modules/shared';
import { Session } from '../../../domain';
import { SessionId } from '../../../domain/value-objects/session-id.vo';

@Injectable()
export class SessionMapper implements IMapper<Session, PrismaSession> {
  toDomain(record: PrismaSession): Session {
    return Session.reconstitute({
      id: SessionId.from(record.id),
      expiresAt: record.expiresAt,
      token: record.token,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      userId: record.userId,
    });
  }

  toPersistence(entity: Session): Omit<PrismaSession, 'id'> {
    return {
      expiresAt: entity.expiresAt,
      token: entity.token,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      userId: entity.userId,
    };
  }
}
