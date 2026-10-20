import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';
import { BoardService } from '../services/board.service';
import {
  SavePlanDto,
  SwitchModeDto,
  ImportContentDto,
  AttachQuestionDto,
  SubmitResponseDto,
  MarkResponseDto,
  GetUploadUrlDto,
} from '../dto';

@Controller()
@UseGuards(AuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // ---------------------------------------------------------------------------
  // Organization-scoped endpoints
  // ---------------------------------------------------------------------------

  @Get('organizations/:organizationId/boards/:boardId')
  async getBoard(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
  ) {
    return this.boardService.getBoard(boardId, organizationId);
  }

  @Post('organizations/:organizationId/boards/:boardId/plan')
  async savePlan(
    @Param('boardId') boardId: string,
    @Body() dto: SavePlanDto,
  ) {
    return this.boardService.savePlan(boardId, dto);
  }

  @Post('organizations/:organizationId/boards/:boardId/plan/complete')
  async completePlan(
    @Param('boardId') boardId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.completePlan(boardId, correlationId);
  }

  @Post('organizations/:organizationId/boards/:boardId/mode')
  async switchMode(
    @Param('boardId') boardId: string,
    @Body() dto: SwitchModeDto,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.switchMode(
      boardId,
      dto,
      user.id,
      correlationId,
    );
  }

  @Post('organizations/:organizationId/boards/:boardId/lock')
  async lockBoard(
    @Param('boardId') boardId: string,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.lockBoard(boardId, user.id, correlationId);
  }

  @Post('organizations/:organizationId/boards/:boardId/unlock')
  async unlockBoard(
    @Param('boardId') boardId: string,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.unlockBoard(boardId, user.id, correlationId);
  }

  @Post('organizations/:organizationId/boards/:boardId/import')
  async importContent(
    @Param('boardId') targetBoardId: string,
    @Body() dto: ImportContentDto,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.importContent(
      targetBoardId,
      dto,
      user.id,
      correlationId,
    );
  }

  @Get('organizations/:organizationId/boards/:boardId/questions')
  async listQuestions(@Param('boardId') boardId: string) {
    return this.boardService.listQuestions(boardId);
  }

  @Post('organizations/:organizationId/boards/:boardId/questions')
  async attachQuestion(
    @Param('boardId') boardId: string,
    @Body() dto: AttachQuestionDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.attachQuestion(boardId, dto, correlationId);
  }

  @Delete('organizations/:organizationId/boards/:boardId/questions/:bqId')
  async removeQuestion(
    @Param('boardId') boardId: string,
    @Param('bqId') bqId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.removeQuestion(boardId, bqId, correlationId);
  }

  // ---------------------------------------------------------------------------
  // Global board endpoints
  // ---------------------------------------------------------------------------

  @Get('boards/lessons/:lessonId')
  async getBoardByLesson(@Param('lessonId') lessonId: string) {
    return this.boardService.getBoardByLesson(lessonId);
  }

  @Post('boards/:boardId/questions/:bqId/responses')
  async submitResponse(
    @Param('bqId') bqId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SubmitResponseDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.submitResponse(bqId, user.id, dto, correlationId);
  }

  @Get('boards/:boardId/questions/:bqId/responses')
  async listResponses(@Param('bqId') bqId: string) {
    return this.boardService.listResponses(bqId);
  }

  @Get('boards/:boardId/questions/:bqId/responses/me')
  async getMyResponse(
    @Param('bqId') bqId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.boardService.getResponse(bqId, user.id);
  }

  @Post('boards/:boardId/questions/:bqId/responses/:respId/mark')
  async markResponse(
    @Param('respId') respId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: MarkResponseDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.markResponse(respId, user.id, dto, correlationId);
  }

  @Post('boards/:boardId/upload-url')
  async getUploadUrl(
    @Param('boardId') boardId: string,
    @Body() dto: GetUploadUrlDto,
  ) {
    return this.boardService.getUploadUrl(boardId, dto);
  }
}
