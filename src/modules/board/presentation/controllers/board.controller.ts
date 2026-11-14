import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
  AddSectionDto,
  UpdateSectionDto,
  SaveCanvasStateDto,
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
      user.userId ?? user.sub,
      correlationId,
    );
  }

  @Post('organizations/:organizationId/boards/:boardId/lock')
  async lockBoard(
    @Param('boardId') boardId: string,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.lockBoard(boardId, user.userId ?? user.sub, correlationId);
  }

  @Post('organizations/:organizationId/boards/:boardId/unlock')
  async unlockBoard(
    @Param('boardId') boardId: string,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.unlockBoard(boardId, user.userId ?? user.sub, correlationId);
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
      user.userId ?? user.sub,
      correlationId,
    );
  }

  @Post('organizations/:organizationId/boards/:boardId/sections')
  async addSection(
    @Param('boardId') boardId: string,
    @Body() dto: AddSectionDto,
    @CurrentUser() user: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.addSection(
      boardId,
      dto,
      user.userId ?? user.sub,
      correlationId,
    );
  }

  @Patch('organizations/:organizationId/boards/:boardId/sections/:sectionId')
  async updateSection(
    @Param('boardId') boardId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.updateSection(boardId, sectionId, dto, correlationId);
  }

  @Delete('organizations/:organizationId/boards/:boardId/sections/:sectionId')
  async removeSection(
    @Param('boardId') boardId: string,
    @Param('sectionId') sectionId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.removeSection(boardId, sectionId, correlationId);
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
    return this.boardService.submitResponse(bqId, user.userId ?? user.sub, dto, correlationId);
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
    return this.boardService.getResponse(bqId, user.userId ?? user.sub);
  }

  @Post('boards/:boardId/questions/:bqId/responses/:respId/mark')
  async markResponse(
    @Param('respId') respId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: MarkResponseDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.boardService.markResponse(respId, user.userId ?? user.sub, dto, correlationId);
  }

  @Post('boards/:boardId/upload-url')
  async getUploadUrl(
    @Param('boardId') boardId: string,
    @Body() dto: GetUploadUrlDto,
  ) {
    return this.boardService.getUploadUrl(boardId, dto);
  }

  @Patch('boards/:boardId/canvas')
  async saveCanvasState(
    @Param('boardId') boardId: string,
    @Body() dto: SaveCanvasStateDto,
  ) {
    return this.boardService.saveCanvasState(boardId, dto);
  }

  @Patch('organizations/:organizationId/boards/:boardId/canvas')
  async saveOrgCanvasState(
    @Param('boardId') boardId: string,
    @Body() dto: SaveCanvasStateDto,
  ) {
    return this.boardService.saveCanvasState(boardId, dto);
  }
}
