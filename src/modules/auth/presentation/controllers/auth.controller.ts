import { Body, Controller, Headers, Ip, Post } from '@nestjs/common';
import { CorrelationId } from '@modules/shared';
import {
  ChangePasswordDto,
  LoginDto,
  RequestPasswordResetDto,
  ResendOtpDto,
  VerifyOtpDto,
} from '../dto';
import { AuthService } from '../services';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.auth.login(dto, ip, userAgent, correlationId);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.auth.verifyOtp(dto, ip, userAgent, correlationId);
  }

  @Post('resend-otp')
  async resendOtp(
    @Body() dto: ResendOtpDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.auth.resendOtp(dto, correlationId);
  }

  @Post('request-password-reset')
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.auth.requestPasswordReset(dto, correlationId);
  }

  @Post('change-password')
  async changePassword(@Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(dto);
  }
}
