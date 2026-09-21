export class RegisterDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  userType!: string;
}

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
  authAccountId!: string;
}

export class ResendOtpDto {
  authAccountId!: string;
}
