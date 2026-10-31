import { Body, Controller, Get, Headers, Ip, Post, Query, Res } from '@nestjs/common';
import { CorrelationId } from '@modules/shared';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  ChangePasswordDto,
  GoogleAuthorizationDto,
  GoogleTokenExchangeDto,
  LoginDto,
  RefreshTokenDto,
  RequestPasswordResetDto,
  RegisterEmailDto,
  ResendOtpDto,
  VerifyOtpDto,
} from '../dto';
import { AuthService } from '../services';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register/email')
  @ApiOperation({ summary: 'Start email and password registration' })
  async registerEmail(
    @Body() dto: RegisterEmailDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.auth.registerEmail(dto, correlationId);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.auth.login(dto, ip, userAgent, correlationId);
  }

  @Get('google')
  @ApiOperation({
    summary: 'Start Google sign-in or sign-up',
    description:
      'Redirects to Google using authorization code flow with PKCE. Role selection happens during Eduvia onboarding.',
  })
  @ApiQuery({ name: 'intent', required: false, enum: ['login', 'signup'] })
  @ApiQuery({ name: 'returnPath', required: false, example: '/auth/oauth/callback' })
  @ApiResponse({ status: 302, description: 'Redirect to Google' })
  async beginGoogle(
    @Query() dto: GoogleAuthorizationDto,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.auth.beginGoogle(dto);
    response.redirect(result.authorizationUrl);
  }

  @Get('google/callback')
  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      'Google redirects here. The endpoint redirects the browser to the frontend with a short-lived one-time OAuth handoff code.',
  })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'state', required: true })
  @ApiResponse({ status: 302, description: 'Redirect to the configured frontend callback page' })
  async completeGoogle(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.auth.completeGoogle(code, state, ip, userAgent);
    response.redirect(result.redirectUrl);
  }

  @Post('google/exchange')
  @ApiOperation({
    summary: 'Exchange a one-time Google OAuth handoff code for Eduvia tokens',
  })
  @ApiResponse({ status: 201, description: 'Eduvia access and refresh tokens' })
  async exchangeGoogle(@Body() dto: GoogleTokenExchangeDto) {
    return this.auth.exchangeGoogle(dto);
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.auth.refresh(dto, ip, userAgent);
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
