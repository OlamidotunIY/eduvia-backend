import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/shared';
import { CurriculumService } from '../services/curriculum.service';
import {
  CreatePlatformSubjectDto,
  CreateSubjectCurriculumMappingDto,
} from '../dto';

@Controller('platform-subjects')
@UseGuards(AuthGuard)
export class PlatformSubjectController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get()
  async listPlatformSubjects(@Query('activeOnly') activeOnly?: string) {
    const isBool = activeOnly !== undefined ? activeOnly === 'true' : undefined;
    return this.curriculumService.listPlatformSubjects(isBool);
  }

  @Post()
  async createPlatformSubject(@Body() dto: CreatePlatformSubjectDto) {
    return this.curriculumService.createPlatformSubject(dto);
  }

  @Post(':id/curriculum-mapping')
  async createSubjectCurriculumMapping(
    @Param('id') id: string,
    @Body() dto: CreateSubjectCurriculumMappingDto,
  ) {
    return this.curriculumService.createSubjectCurriculumMapping(id, dto);
  }
}
