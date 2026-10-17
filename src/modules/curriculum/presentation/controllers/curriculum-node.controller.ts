import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CorrelationId } from '@modules/shared';
import { CurriculumService } from '../services/curriculum.service';
import { UpdateCurriculumNodeDto } from '../dto';

@Controller('curriculum-nodes')
@UseGuards(AuthGuard)
export class CurriculumNodeController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get('search')
  async searchNodes(
    @Query('q') query: string,
    @Query('curriculumId') curriculumId?: string,
  ) {
    return this.curriculumService.searchNodes(query ?? '', curriculumId);
  }

  @Get(':nodeId')
  async getNode(@Param('nodeId') nodeId: string) {
    return this.curriculumService.getNode(nodeId);
  }

  @Patch(':nodeId')
  async updateNode(
    @Param('nodeId') nodeId: string,
    @Body() dto: UpdateCurriculumNodeDto,
    @CorrelationId() correlationId?: string,
  ) {
    return this.curriculumService.updateNode(nodeId, dto, correlationId);
  }

  @Post(':nodeId/deactivate')
  async deactivateNode(
    @Param('nodeId') nodeId: string,
    @CorrelationId() correlationId?: string,
  ) {
    return this.curriculumService.deactivateNode(nodeId, correlationId);
  }
}
