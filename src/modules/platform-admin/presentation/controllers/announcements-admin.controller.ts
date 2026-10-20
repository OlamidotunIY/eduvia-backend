import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUser, type CurrentUserPayload } from '@modules/shared';
import { PlatformAdminService } from '../services/platform-admin.service';
import { CreateAnnouncementDto, ScheduleAnnouncementDto } from '../dto';
import { AnnouncementStatus } from '../../domain';

@Controller('platform-admin/announcements')
@UseGuards(AuthGuard)
export class AnnouncementsAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) {}

  @Post()
  async createAnnouncement(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateAnnouncementDto,
  ) {
    const creatorUserId = user.userId || user.sub;
    return this.platformAdminService.createAnnouncement(creatorUserId, dto);
  }

  @Get()
  async listAnnouncements(@Query('status') status?: AnnouncementStatus) {
    return this.platformAdminService.listAnnouncements(status);
  }

  @Get(':id')
  async getAnnouncementById(@Param('id') id: string) {
    return this.platformAdminService.getAnnouncementById(id);
  }

  @Post(':id/publish')
  async publishAnnouncement(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    const adminUserId = user.userId || user.sub;
    return this.platformAdminService.publishAnnouncement(adminUserId, id);
  }

  @Post(':id/schedule')
  async scheduleAnnouncement(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: ScheduleAnnouncementDto,
  ) {
    const adminUserId = user.userId || user.sub;
    return this.platformAdminService.scheduleAnnouncement(adminUserId, id, dto);
  }

  @Post(':id/archive')
  async archiveAnnouncement(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    const adminUserId = user.userId || user.sub;
    return this.platformAdminService.archiveAnnouncement(adminUserId, id);
  }
}
