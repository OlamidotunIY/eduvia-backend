export class LoginDto {
  email!: string;
  password!: string;
}

export class LogoutDto {
  sessionId!: string;
  jti!: string;
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
