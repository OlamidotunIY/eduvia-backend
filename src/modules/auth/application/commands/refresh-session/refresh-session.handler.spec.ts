import { InvalidRefreshTokenError, Session, SessionId } from '../../../domain';
import { RefreshSessionCommand } from './refresh-session.command';
import { RefreshSessionHandler } from './refresh-session.handler';

describe('RefreshSessionHandler', () => {
  const currentRefreshToken = 'current-refresh-token';
  const nextRefreshToken = 'next-refresh-token';
  const nextRefreshHash = 'next-refresh-hash';

  function setup(refreshTokenIsValid = true) {
    const session = Session.create({
      id: SessionId.create(),
      expiresAt: new Date(Date.now() + 60_000),
      token: 'current-refresh-hash',
      userId: 'user-1',
    });
    const sessionRepository = {
      findById: jest.fn().mockResolvedValue(session),
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const authAccountRepository = {
      findByUserId: jest.fn().mockResolvedValue({
        getId: () => 'account-1',
        scope: 'user',
      }),
    };
    const userQueryPort = {
      getUserById: jest.fn().mockResolvedValue({
        id: 'user-1',
        userType: 'parent',
      }),
    };
    const passwordHashPort = {
      compare: jest.fn().mockResolvedValue(refreshTokenIsValid),
    };
    const refreshExpiresAt = new Date(Date.now() + 120_000);
    const tokenPort = {
      generateRefreshToken: jest.fn().mockResolvedValue({
        raw: nextRefreshToken,
        hash: nextRefreshHash,
        expiresAt: refreshExpiresAt,
      }),
      generateAccessToken: jest.fn().mockResolvedValue({
        token: 'access-token',
        jti: 'jti-1',
        expiresAt: new Date(Date.now() + 30_000),
      }),
    };

    const handler = new RefreshSessionHandler(
      sessionRepository as never,
      authAccountRepository as never,
      userQueryPort as never,
      passwordHashPort as never,
      tokenPort as never,
    );

    return {
      handler,
      session,
      sessionRepository,
      tokenPort,
      refreshExpiresAt,
    };
  }

  it('rotates the refresh token and issues a new access token', async () => {
    const { handler, session, sessionRepository, tokenPort, refreshExpiresAt } =
      setup();

    const result = await handler.execute(
      new RefreshSessionCommand({
        sessionId: session.getId(),
        refreshToken: currentRefreshToken,
      }),
    );

    expect(session.token).toBe(nextRefreshHash);
    expect(session.expiresAt).toEqual(refreshExpiresAt);
    expect(sessionRepository.save).toHaveBeenCalledWith(session);
    expect(tokenPort.generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        sessionId: session.getId(),
      }),
    );
    expect(result.refreshToken).toBe(nextRefreshToken);
    expect(result.accessToken).toBe('access-token');
  });

  it('revokes the session when a rotated refresh token is reused', async () => {
    const { handler, session, sessionRepository } = setup(false);

    await expect(
      handler.execute(
        new RefreshSessionCommand({
          sessionId: session.getId(),
          refreshToken: 'old-refresh-token',
        }),
      ),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);

    expect(sessionRepository.delete).toHaveBeenCalledWith(session.getId());
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });
});
