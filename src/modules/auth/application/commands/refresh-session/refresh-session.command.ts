import { Command } from '@nestjs/cqrs';
import type { RefreshSessionResult } from './refresh-session.result';

export interface RefreshSessionPayload {
  sessionId: string;
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
}

export class RefreshSessionCommand extends Command<RefreshSessionResult> {
  constructor(public readonly payload: RefreshSessionPayload) {
    super();
  }
}
