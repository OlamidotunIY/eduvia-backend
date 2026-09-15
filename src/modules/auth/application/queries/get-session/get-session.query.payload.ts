import { SessionStatus } from '../../../domain';
import { UserType } from '@modules/user';

export interface SessionDTO {
  id: number;
  authAccountId: number;
  userId: number;
  userType: UserType;
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
  sessionId: number;
}
