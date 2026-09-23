import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';
import { RegisterStudentDto, RegisterUserDto } from '../dto';
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
  async getMe(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.userService.getMe(currentUser.userId);
  }

  @UseGuards(AuthGuard)
  @Post('parents/students')
  async registerStudent(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: RegisterStudentDto,
  ) {
    return this.userService.registerStudent(currentUser.userId, dto);
  }
}
