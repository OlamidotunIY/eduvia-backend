export class LoginDto {
  email!: string;
  password!: string;
}

export class LogoutDto {
  sessionId!: number;
  jti!: string;
}

export class VerifyOtpDto {
  code!: string;
  authAccountId!: number;
}

export class ResendOtpDto {
  authAccountId!: number;
}
