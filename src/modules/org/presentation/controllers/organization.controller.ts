import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  OrganizationPermissionGuard,
  RequireOrganizationPermissions,
  type CurrentUserPayload,
} from '@modules/shared';
import {
  ChangeMemberRoleDTO,
  CreateOrganizationRoleDTO,
  CreateOrganizationDTO,
  CreateSubjectDTO,
  ReceiveTeacherApplicationDTO,
  RejectApplicationDTO,
  SendInvitationDTO,
  UpdateOrganizationDTO,
  UpdatePolicyDTO,
  UpdateSubjectDTO,
  UpdateOrganizationRoleDTO,
} from '../dto';
import { OrganizationService } from '../services';
import { OrganizationPermission } from '../../domain';

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
  @Post('active/:organizationId')
  async selectActiveOrganization(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.organizationService.selectActiveOrganization(
      currentUser.userId,
      organizationId,
      correlationId,
    );
  }

  @UseGuards(AuthGuard)
  @Post('invitations/:token/accept')
  async acceptInvitation(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('token') token: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.organizationService.acceptInvitation(
      token,
      currentUser.userId,
      correlationId,
    );
  }

  @Get(':slug')
  async getOrganizationBySlug(@Param('slug') slug: string) {
    return this.organizationService.getOrganizationBySlug(slug);
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.ORGANIZATION_UPDATE)
  @Patch(':organizationId')
  async updateProfile(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateOrganizationDTO,
    @CorrelationId() correlationId: string,
  ) {
    return this.organizationService.updateProfile(
      organizationId,
      currentUser.userId,
      dto,
      correlationId,
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.ORGANIZATION_MARKETPLACE_MANAGE)
  @Post(':organizationId/marketplace/list')
  async listOnMarketplace(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.organizationService.listOnMarketplace(
      organizationId,
      currentUser.userId,
      correlationId,
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.ORGANIZATION_MARKETPLACE_MANAGE)
  @Delete(':organizationId/marketplace/list')
  async delistFromMarketplace(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.organizationService.delistFromMarketplace(
      organizationId,
      currentUser.userId,
      correlationId,
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.ORGANIZATION_POLICY_UPDATE)
  @Patch(':organizationId/policy')
  async updatePolicy(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdatePolicyDTO,
    @CorrelationId() correlationId: string,
  ) {
    return this.organizationService.updatePolicy(
      organizationId,
      currentUser.userId,
      dto,
      correlationId,
    );
  }

  @Get(':organizationId/subjects')
  async getSubjects(
    @Param('organizationId') organizationId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.organizationService.getSubjects(
      organizationId,
      activeOnly === 'true',
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.SUBJECTS_CREATE)
  @Post(':organizationId/subjects')
  async createSubject(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateSubjectDTO,
  ) {
    return this.organizationService.createSubject(
      organizationId,
      currentUser.userId,
      dto,
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.SUBJECTS_UPDATE)
  @Patch(':organizationId/subjects/:subjectId')
  async updateSubject(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @Param('subjectId') subjectId: string,
    @Body() dto: UpdateSubjectDTO,
  ) {
    return this.organizationService.updateSubject(
      organizationId,
      subjectId,
      currentUser.userId,
      dto,
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.APPLICATIONS_READ)
  @Get(':organizationId/applications')
  async getApplications(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
  ) {
    return this.organizationService.getApplications(
      organizationId,
      currentUser.userId,
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

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.APPLICATIONS_REVIEW)
  @Post(':organizationId/applications/:id/approve')
  async approveApplication(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.organizationService.approveApplication(
      organizationId,
      id,
      currentUser.userId,
      correlationId,
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.APPLICATIONS_REVIEW)
  @Post(':organizationId/applications/:id/reject')
  async rejectApplication(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: RejectApplicationDTO,
    @CorrelationId() correlationId: string,
  ) {
    return this.organizationService.rejectApplication(
      organizationId,
      id,
      currentUser.userId,
      dto,
      correlationId,
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.MEMBERS_INVITE)
  @Post(':organizationId/invitations')
  async sendInvitation(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @Body() dto: SendInvitationDTO,
    @CorrelationId() correlationId: string,
  ) {
    return this.organizationService.sendInvitation(
      organizationId,
      currentUser.userId,
      dto,
      correlationId,
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.MEMBERS_READ)
  @Get(':organizationId/members')
  async getMembers(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
  ) {
    return this.organizationService.getMembers(
      organizationId,
      currentUser.userId,
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.ROLES_READ)
  @Get(':organizationId/roles')
  async getRoles(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
  ) {
    return this.organizationService.getRoles(organizationId, currentUser.userId);
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.ROLES_MANAGE)
  @Post(':organizationId/roles/provision')
  async provisionRoles(
    @Param('organizationId') organizationId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.organizationService.provisionRoles(organizationId, correlationId);
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.ROLES_MANAGE)
  @Post(':organizationId/roles')
  async createRole(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateOrganizationRoleDTO,
  ) {
    return this.organizationService.createRole(
      organizationId,
      currentUser.userId,
      dto,
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.ROLES_MANAGE)
  @Patch(':organizationId/roles/:roleId')
  async updateRole(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @Param('roleId') roleId: string,
    @Body() dto: UpdateOrganizationRoleDTO,
  ) {
    return this.organizationService.updateRole(
      organizationId,
      roleId,
      currentUser.userId,
      dto,
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.MEMBERS_MANAGE)
  @Patch(':organizationId/members/:userId/role')
  async changeMemberRole(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @Param('userId') targetUserId: string,
    @Body() dto: ChangeMemberRoleDTO,
  ) {
    return this.organizationService.changeMemberRole(
      organizationId,
      currentUser.userId,
      targetUserId,
      dto,
    );
  }

  @UseGuards(AuthGuard, OrganizationPermissionGuard)
  @RequireOrganizationPermissions(OrganizationPermission.MEMBERS_MANAGE)
  @Delete(':organizationId/members/:userId')
  async suspendMember(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('organizationId') organizationId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.organizationService.suspendMember(
      organizationId,
      currentUser.userId,
      targetUserId,
    );
  }
}
