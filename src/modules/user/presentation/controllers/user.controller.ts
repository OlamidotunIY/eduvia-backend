import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, CorrelationId, CurrentUser } from '@modules/shared';
import { RegisterUserDto } from '../dto';
import { UserService } from '../services';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterUserDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.userService.register(dto, correlationId);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@CurrentUser() payload: { userId: string }) {
    return this.userService.getMe(payload.userId);
  }
}
