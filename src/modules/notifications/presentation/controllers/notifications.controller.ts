import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';
import { NotificationsService } from '../services/notifications.service';
import {
  MarkNotificationReadDto,
  RegisterDeviceTokenDto,
} from '../dto';
import { NotificationStatus } from '../../domain';

@Controller()
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('notifications')
  async listNotifications(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: NotificationStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    return this.notificationsService.getNotifications(
      user.id,
      status,
      parsedLimit,
      parsedOffset,
    );
  }

  @Get('notifications/count')
  async getUnreadCount(@CurrentUser() user: CurrentUserPayload) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Post('notifications/mark-read')
  async markRead(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto?: MarkNotificationReadDto,
  ) {
    return this.notificationsService.markRead(user.id, dto?.notificationId);
  }

  @Post('devices/tokens')
  async registerDeviceToken(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    return this.notificationsService.registerDeviceToken(user.id, dto);
  }

  @Delete('devices/tokens/:token')
  async removeDeviceToken(@Param('token') token: string) {
    return this.notificationsService.removeDeviceToken(token);
  }
}
