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
import { AuthGuard } from '@modules/shared';
import { AiService } from '../services/ai.service';
import {
  CreatePromptTemplateRequestDto,
  UpdatePromptTemplateRequestDto,
} from '../dto';
import { AiJobType } from '../../domain';

@Controller('ai')
@UseGuards(AuthGuard)
export class AiPromptTemplateController {
  constructor(private readonly aiService: AiService) {}

  @Get('prompt-templates')
  async listPromptTemplates(
    @Query('type') type?: AiJobType,
    @Query('isActive') isActive?: string,
  ) {
    const activeBool =
      isActive !== undefined ? isActive === 'true' : undefined;
    return this.aiService.listPromptTemplates({
      type,
      isActive: activeBool,
    });
  }

  @Post('prompt-templates')
  async createPromptTemplate(@Body() dto: CreatePromptTemplateRequestDto) {
    return this.aiService.createPromptTemplate(dto);
  }

  @Patch('prompt-templates/:id')
  async updatePromptTemplate(
    @Param('id') id: string,
    @Body() dto: UpdatePromptTemplateRequestDto,
  ) {
    return this.aiService.updatePromptTemplate(id, dto);
  }

  @Post('prompt-templates/:id/deprecate')
  async deprecatePromptTemplate(@Param('id') id: string) {
    return this.aiService.deprecatePromptTemplate(id);
  }

  @Get('cost-summary')
  async getCostSummary() {
    return this.aiService.getCostSummary();
  }
}
