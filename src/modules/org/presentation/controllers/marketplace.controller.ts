import { Controller, Get } from '@nestjs/common';
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
}
