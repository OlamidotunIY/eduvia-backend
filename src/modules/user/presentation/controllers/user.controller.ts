import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';
import { RegisterStudentDto, RegisterUserDto, UpdateUserDto } from '../dto';
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
  @Patch('me')
  async updateMe(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateUserDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.userService.updateProfile(currentUser.userId, dto, correlationId);
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
