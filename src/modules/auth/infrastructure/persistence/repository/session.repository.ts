import { Injectable } from '@nestjs/common';
import { Session as PrismaSession } from '@generated/prisma/client';
import { SessionMapper } from '../mappers';
import { PrismaBaseRepository, PrismaService, RedisService } from '@modules/shared';
import { ISessionRepository, Session, SessionId } from '../../../domain';

@Injectable()
export class PrismaSessionRepository
  extends PrismaBaseRepository<SessionId, Session, PrismaSession>
  implements ISessionRepository
{
  constructor(
    prisma: PrismaService,
    mapper: SessionMapper,
    private readonly redis: RedisService,
  ) {
    super(prisma, mapper);
  }

  protected get delegate() {
    return this.prisma.session;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const records = await this.delegate.findMany({
      where: { userId },
    });
    return records.map((r) => this.mapper.toDomain(r));
  }

  override async findById(id: SessionId | string): Promise<Session | null> {
    const cached = await this.redis.getClient().get(this.cacheKey(String(id)));
    if (!cached) {
      return null;
    }
    const data = JSON.parse(cached);

    return Session.reconstitute({
      ...data,
      id: SessionId.from(String(id)),
      expiresAt: new Date(data.expiresAt),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  override async save(entity: Session): Promise<void> {
    await super.save(entity);
    const ttlSeconds = Math.max(
      0,
      Math.floor((entity.expiresAt.getTime() - Date.now()) / 1000),
    );

    if (ttlSeconds > 0) {
      await this.redis
        .getClient()
        .set(
          this.cacheKey(entity.getId()),
          JSON.stringify(this.toCache(entity)),
          'EX',
          ttlSeconds,
        );
    }
  }

  override async delete(id: SessionId | string): Promise<void> {
    await this.redis.getClient().del(this.cacheKey(String(id)));
    await super.delete(id);
  }

  async deleteByUserId(userId: string): Promise<void> {
    const sessions = await this.delegate.findMany({ where: { userId } });
    await Promise.all(
      sessions.map((session) =>
        this.redis.getClient().del(this.cacheKey(session.id)),
      ),
    );
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  private cacheKey(sessionId: string): string {
    return `auth:session:${sessionId}`;
  }

  private toCache(entity: Session) {
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
