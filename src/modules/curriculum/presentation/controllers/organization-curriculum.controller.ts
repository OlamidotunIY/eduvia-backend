import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  OrganizationPermissionGuard,
  RequireOrganizationPermissions,
} from '@modules/shared';
import { CurriculumService } from '../services/curriculum.service';
import { OrganizationPermission } from '../../../org/domain';

@Controller('organizations/:organizationId/curriculum')
@UseGuards(AuthGuard, OrganizationPermissionGuard)
export class OrganizationCurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get('overview')
  @RequireOrganizationPermissions(OrganizationPermission.CURRICULUM_READ)
  async getOverview(@Param('organizationId') organizationId: string) {
    return this.curriculumService.getOrganizationCurriculumOverview(
      organizationId,
    );
  }

  @Get(':curriculumId/tree')
  @RequireOrganizationPermissions(OrganizationPermission.CURRICULUM_READ)
  async getTree(
    @Param('organizationId') organizationId: string,
    @Param('curriculumId') curriculumId: string,
    @Query('preview') preview?: string,
  ) {
    return this.curriculumService.getOrganizationCurriculumTree(
      organizationId,
      curriculumId,
      preview === 'true',
    );
  }

  @Get('search')
  @RequireOrganizationPermissions(OrganizationPermission.CURRICULUM_READ)
  async searchNodes(
    @Param('organizationId') organizationId: string,
    @Query('q') query: string,
    @Query('curriculumId') curriculumId?: string,
  ) {
    return this.curriculumService.searchOrganizationCurriculumNodes(
      organizationId,
      query ?? '',
      curriculumId,
    );
  }
}
