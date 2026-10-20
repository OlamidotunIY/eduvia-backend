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
import {
  CreateCurriculumProfileDto,
  UpdateCurriculumProfileDto,
  CreateCurriculumNodeDto,
} from '../dto';

@Controller('curricula')
@UseGuards(AuthGuard)
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get()
  async listCurricula(
    @Query('countryCode') countryCode?: string,
    @Query('isActive') isActive?: string,
  ) {
    const activeBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.curriculumService.listCurricula({
      countryCode,
      isActive: activeBool,
    });
  }

  @Post()
  async createCurriculum(
    @Body() dto: CreateCurriculumProfileDto,
    @CorrelationId() correlationId?: string,
  ) {
    return this.curriculumService.createCurriculum(dto, correlationId);
  }

  @Get(':id')
  async getCurriculum(@Param('id') id: string) {
    return this.curriculumService.getCurriculum(id);
  }

  @Patch(':id')
  async updateCurriculum(
    @Param('id') id: string,
    @Body() dto: UpdateCurriculumProfileDto,
  ) {
    return this.curriculumService.updateCurriculum(id, dto);
  }

  @Post(':id/activate')
  async activateCurriculum(@Param('id') id: string) {
    return this.curriculumService.activateCurriculum(id);
  }

  @Post(':id/deactivate')
  async deactivateCurriculum(@Param('id') id: string) {
    return this.curriculumService.deactivateCurriculum(id);
  }

  @Get(':id/tree')
  async getCurriculumTree(@Param('id') id: string) {
    return this.curriculumService.getCurriculumTree(id);
  }

  @Get(':id/nodes')
  async listNodes(
    @Param('id') id: string,
    @Query('depth') depth?: string,
  ) {
    const depthNum = depth !== undefined ? parseInt(depth, 10) : undefined;
    return this.curriculumService.listNodes(id, depthNum);
  }

  @Post(':id/nodes')
  async createNode(
    @Param('id') id: string,
    @Body() dto: CreateCurriculumNodeDto,
    @CorrelationId() correlationId?: string,
  ) {
    return this.curriculumService.createNode(id, dto, correlationId);
  }
}
