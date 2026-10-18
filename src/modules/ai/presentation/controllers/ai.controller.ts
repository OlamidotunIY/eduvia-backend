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
import { AiService } from '../services/ai.service';
import {
  GenerateQuestionsRequestDto,
  GenerateNextLessonSuggestionRequestDto,
} from '../dto';
import { AiJobType, AiJobStatus } from '../../domain';

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('questions/generate')
  async generateQuestions(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: GenerateQuestionsRequestDto,
  ) {
    const orgId = user.orgId;
    const requestedBy = user.userId || user.sub;
    return this.aiService.generateQuestions(orgId, requestedBy, dto);
  }

  @Post('suggestions/next-lesson')
  async generateNextLessonSuggestion(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: GenerateNextLessonSuggestionRequestDto,
  ) {
    const orgId = user.orgId;
    const requestedBy = user.userId || user.sub;
    return this.aiService.generateNextLessonSuggestion(orgId, requestedBy, dto);
  }

  @Get('jobs/:jobId')
  async getJobById(@Param('jobId') jobId: string) {
    return this.aiService.getJobById(jobId);
  }

  @Get('jobs')
  async listJobs(
    @CurrentUser() user: CurrentUserPayload,
    @Query('type') type?: AiJobType,
    @Query('status') status?: AiJobStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.aiService.listJobs(user.orgId, {
      type,
      status,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Post('jobs/:id/cancel')
  async cancelJob(@Param('id') id: string) {
    return this.aiService.cancelJob(id);
  }
}
