import { Session, SessionId } from '../../../domain';
import { PrismaSessionRepository } from './session.repository';

describe('PrismaSessionRepository', () => {
  const sessionId = SessionId.create().value;
  const record = {
    id: sessionId,
    token: 'hashed-refresh-token',
    userId: 'user-1',
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: null,
    userAgent: null,
  };

  it('falls back to persistent storage and restores the Redis cache on a cache miss', async () => {
    const cache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn(),
    };
    const entity = Session.reconstitute({
      ...record,
      id: SessionId.from(record.id),
    });
    const prisma = {
      session: { findUnique: jest.fn().mockResolvedValue(record) },
    };
    const mapper = { toDomain: jest.fn().mockReturnValue(entity) };
    const redis = { getClient: jest.fn().mockReturnValue(cache) };
    const repository = new PrismaSessionRepository(
      prisma as never,
      mapper as never,
      redis as never,
    );

    const session = await repository.findById(record.id);

    expect(session?.getId()).toBe(record.id);
    expect(prisma.session.findUnique).toHaveBeenCalledWith({
      where: { id: record.id },
    });
    expect(cache.set).toHaveBeenCalledWith(
      `auth:session:${record.id}`,
      expect.any(String),
      'EX',
      expect.any(Number),
    );
  });
});
