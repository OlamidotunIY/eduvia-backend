import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { WsException } from '@nestjs/websockets';

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockJwtService = {
      verifyAsync: jest.fn(),
    };
    mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };
    guard = new WsJwtGuard(mockJwtService, mockConfigService);
  });

  const createMockContext = (authHeader?: string, authObject?: any) => {
    const mockSocket: any = {
      handshake: {
        headers: authHeader ? { authorization: authHeader } : {},
        auth: authObject ?? {},
      },
      join: jest.fn(),
    };

    return {
      switchToWs: () => ({
        getClient: () => mockSocket,
      }),
      mockSocket,
    };
  };

  it('should throw WsException when token is missing', async () => {
    const { switchToWs } = createMockContext();
    const context = { switchToWs } as any;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new WsException('Missing authentication token'),
    );
  });

  it('should verify token, attach auth payload to socket, and join user room', async () => {
    const payload = {
      sub: 'auth-1',
      userId: 'user-1',
      orgId: 'org-1',
      userType: 'teacher',
    };
    mockJwtService.verifyAsync.mockResolvedValue(payload);

    const { switchToWs, mockSocket } = createMockContext('Bearer valid-token');
    const context = { switchToWs } as any;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockSocket.auth).toEqual(payload);
    expect(mockSocket.join).toHaveBeenCalledWith('user:user-1');
    expect(mockSocket.join).toHaveBeenCalledWith('org:org-1');
  });

  it('should throw WsException when token is invalid or expired', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    const { switchToWs } = createMockContext(undefined, { token: 'expired-token' });
    const context = { switchToWs } as any;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new WsException('Invalid or expired authentication token'),
    );
  });
});
