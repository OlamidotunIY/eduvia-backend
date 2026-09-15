import { Injectable } from '@nestjs/common';
import { Session as PrismaSession } from '@generated/prisma/client';
import { SessionMapper } from '../mappers';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { ISessionRepository, Session } from '../../domain';
import { SessionId } from '../../domain/value-objects/session-id.vo';

@Injectable()
export class PrismaSessionRepository
  extends PrismaBaseRepository<SessionId, Session, PrismaSession>
  implements ISessionRepository
{
  constructor(prisma: PrismaService, mapper: SessionMapper) {
    super(prisma, mapper);
  }

  protected get delegate() {
    return this.prisma.session;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const records = await this.prisma.session.findMany({
      where: { authAccount: { userId } },
    });
    return records.map((r) => this.mapper.toDomain(r));
  }
}
