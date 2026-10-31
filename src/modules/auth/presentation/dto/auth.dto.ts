export class LoginDto {
  email!: string;
  password!: string;
}

export class RegisterEmailDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  timezone?: string;
}

export class LogoutDto {
  sessionId!: string;
  jti!: string;
}

export class RefreshTokenDto {
  sessionId!: string;
  refreshToken!: string;
}

export class VerifyOtpDto {
  code!: string;
  email!: string;
}

export class ResendOtpDto {
  email!: string;
}

export class RequestPasswordResetDto {
  email!: string;
}

export class ChangePasswordDto {
  email!: string;
  code!: string;
  newPassword!: string;
}

export class GoogleAuthorizationDto {
  /** Use signup for a first-time Eduvia account, or login for an existing Google-linked account. */
  intent?: GoogleOAuthIntent;
  /** Relative frontend path to receive the one-time OAuth handoff code. */
  returnPath?: string;
}

export class GoogleTokenExchangeDto {
  /** The single-use code issued to the frontend after Google authentication. */
  code!: string;
}
import { GoogleOAuthIntent } from '../../domain';
