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
import {
  CreatePlatformAdminDto,
  ApproveOrgDto,
  RejectOrgDto,
  SuspendOrgDto,
} from '../dto';

@Controller('platform-admin')
@UseGuards(AuthGuard)
export class PlatformAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) {}

  @Post('admins')
  async createPlatformAdmin(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreatePlatformAdminDto,
  ) {
    const callerUserId = user.userId || user.sub;
    return this.platformAdminService.createPlatformAdmin(callerUserId, dto);
  }

  @Get('admins')
  async listPlatformAdmins() {
    return this.platformAdminService.listPlatformAdmins();
  }

  @Post('orgs/:orgId/approve')
  async approveOrg(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orgId') orgId: string,
    @Body() dto: ApproveOrgDto,
  ) {
    const reviewerUserId = user.userId || user.sub;
    return this.platformAdminService.approveOrg(reviewerUserId, orgId, dto);
  }

  @Post('orgs/:orgId/reject')
  async rejectOrg(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orgId') orgId: string,
    @Body() dto: RejectOrgDto,
  ) {
    const reviewerUserId = user.userId || user.sub;
    return this.platformAdminService.rejectOrg(reviewerUserId, orgId, dto);
  }

  @Post('orgs/:orgId/suspend')
  async suspendOrg(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orgId') orgId: string,
    @Body() dto: SuspendOrgDto,
  ) {
    const adminUserId = user.userId || user.sub;
    return this.platformAdminService.suspendOrg(adminUserId, orgId, dto);
  }

  @Post('orgs/:orgId/reactivate')
  async reactivateOrg(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orgId') orgId: string,
  ) {
    const adminUserId = user.userId || user.sub;
    return this.platformAdminService.reactivateOrg(adminUserId, orgId);
  }

  @Get('orgs/approvals')
  async listOrgApprovals(@Query('orgId') orgId?: string) {
    return this.platformAdminService.listOrgApprovals(orgId);
  }

  @Get('health')
  async getPlatformHealth() {
    return this.platformAdminService.getPlatformHealth();
  }

  @Get('queues')
  async getQueueDepths() {
    return this.platformAdminService.getQueueDepths();
  }
}
