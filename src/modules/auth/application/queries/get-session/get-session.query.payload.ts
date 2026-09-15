import { SessionStatus } from '../../../domain';
import { UserType } from '@modules/user';

export interface SessionDTO {
  id: string;
  authAccountId: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  ipAddress: string;
  userAgent: string;
  sessionStatus: SessionStatus;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetSessionPayload {
  sessionId: string;
}
