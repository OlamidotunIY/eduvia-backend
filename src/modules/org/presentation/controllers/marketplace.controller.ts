import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrganizationService } from '../services';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('organizations')
  @ApiOperation({
    summary: 'List active organizations available in the marketplace',
  })
  async listOrganizations() {
    return this.organizationService.listMarketplaceOrganizations();
  }

  @Get('organizations/:organizationId/subjects')
  @ApiOperation({
    summary: 'List active subjects offered by an organization for teacher applications',
  })
  async listOrganizationSubjects(@Param('organizationId') organizationId: string) {
    return this.organizationService.listMarketplaceOrganizationSubjects(organizationId);
  }
}
