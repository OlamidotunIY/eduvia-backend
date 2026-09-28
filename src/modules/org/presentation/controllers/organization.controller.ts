import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';

import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';
import { CreateOrganizationDTO } from '../dto';
import { ReceiveTeacherApplicationDTO } from '../dto/receive-teacher-application.dto';
import { OrganizationService } from '../services';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createOrganization(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CreateOrganizationDTO,
    @CorrelationId() correlationId: string,
  ) {
    return this.organizationService.createOrganization(
      dto,
      currentUser.userId,
      correlationId,
    );
  }

  @UseGuards(AuthGuard)
  @Post(':organizationId/applications')
  async applyToOrganization(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @Body() dto: ReceiveTeacherApplicationDTO,
    @CorrelationId() correlationId: string,
  ) {
    return this.organizationService.applyToOrganization(
      organizationId,
      currentUser.userId,
      dto,
      correlationId,
    );
  }
}
