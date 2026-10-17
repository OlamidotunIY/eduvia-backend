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
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';
import { AssessmentService } from '../services/assessment.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  SearchQuestionsDto,
} from '../dto';

@Controller('questions')
@UseGuards(AuthGuard)
export class QuestionController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  async createQuestion(
    @Body() dto: CreateQuestionDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.assessmentService.createQuestion(dto, correlationId);
  }

  @Get()
  async searchQuestions(
    @Query() dto: SearchQuestionsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assessmentService.searchQuestions(dto, {
      userId: user?.userId,
    });
  }

  @Get(':id')
  async getQuestion(@Param('id') id: string) {
    return this.assessmentService.getQuestion(id);
  }

  @Patch(':id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assessmentService.updateQuestion(id, dto, {
      role: user?.userType ?? 'TEACHER',
      userId: user?.userId,
    });
  }

  @Post(':id/publish')
  async publishQuestion(
    @Param('id') id: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.assessmentService.publishQuestion(id, correlationId);
  }

  @Post(':id/unpublish')
  async unpublishQuestion(@Param('id') id: string) {
    return this.assessmentService.unpublishQuestion(id);
  }
}
