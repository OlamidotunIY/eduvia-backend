import { UnauthorizedError } from '../../../shared';

export class InvalidRefreshTokenError extends UnauthorizedError {
  constructor() {
    super('Invalid or expired refresh token');
  }
}
