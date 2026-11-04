import { GetRegistrationStatusHandler } from './get-registration-status.handler';
import { GetRegistrationStatusQuery } from './get-registration-status.query';

describe('GetRegistrationStatusHandler', () => {
  it('exchanges the completed Google onboarding session only once', async () => {
    const session = {
      sessionId: 'session-1',
      accessToken: 'access-token',
      accessTokenExpiresAt: new Date('2026-01-01'),
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: new Date('2026-02-01'),
    };
    const repository = {
      findById: jest.fn().mockResolvedValue({
        getId: () => '018f9210-9c24-7123-8345-abcdef123456',
        status: 'completed',
        providerId: 'google',
      }),
    };
    const redis = {
      getClient: () => ({
        get: jest.fn().mockResolvedValue('continuation'),
        getdel: jest.fn().mockResolvedValue(JSON.stringify(session)),
      }),
    };
    const handler = new GetRegistrationStatusHandler(
      repository as never,
      redis as never,
    );

    const result = await handler.execute(
      new GetRegistrationStatusQuery({
        registrationRequestId: '018f9210-9c24-7123-8345-abcdef123456',
        registrationContinuation: 'continuation',
      }),
    );

    expect(result.nextAction).toBe('exchange_google_oauth');
    expect(result.session).toEqual(session);
  });
});
