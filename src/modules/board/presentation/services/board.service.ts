import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
import {
  SaveLessonPlanCommand,
  SaveCanvasStateCommand,
  CompleteLessonPlanCommand,
  SwitchBoardModeCommand,
  LockBoardCommand,
  UnlockBoardCommand,
  ImportBoardContentCommand,
  AttachBoardQuestionCommand,
  RemoveBoardQuestionCommand,
  AddBoardSectionCommand,
  UpdateBoardSectionCommand,
  RemoveBoardSectionCommand,
  SubmitStudentResponseCommand,
  MarkStudentResponseCommand,
} from '../../application/commands';
import {
  GetBoardByIdQuery,
  GetBoardByLessonIdQuery,
  ListBoardQuestionsQuery,
  ListStudentResponsesQuery,
  GetStudentResponseQuery,
} from '../../application/queries';
import { BoardStorageService } from '../../infrastructure/services/board-storage.service';

@Injectable()
export class BoardService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly storageService: BoardStorageService,
  ) {}

  async getBoard(boardId: string, orgId?: string) {
    return this.queryBus.execute(new GetBoardByIdQuery(boardId, orgId));
  }

  async getBoardByLesson(lessonId: string, orgId?: string) {
    return this.queryBus.execute(new GetBoardByLessonIdQuery(lessonId, orgId));
  }

  async savePlan(boardId: string, dto: SavePlanDto) {
    return this.commandBus.execute(
      new SaveLessonPlanCommand({
        boardId,
        learningObjectives: dto.learningObjectives,
        topicsCovered: dto.topicsCovered,
        teachingNotes: dto.teachingNotes,
        homeworkDescription: dto.homeworkDescription,
      }),
    );
  }

  async completePlan(boardId: string, correlationId?: string) {
    return this.commandBus.execute(
      new CompleteLessonPlanCommand({
        boardId,
        correlationId,
      }),
    );
  }

  async switchMode(
    boardId: string,
    dto: SwitchModeDto,
    changedBy: string,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new SwitchBoardModeCommand({
        boardId,
        mode: dto.mode,
        changedBy,
        lessonStatus: dto.lessonStatus,
        correlationId,
      }),
    );
  }

  async lockBoard(boardId: string, lockedBy: string, correlationId?: string) {
    return this.commandBus.execute(
      new LockBoardCommand({
        boardId,
        lockedBy,
        correlationId,
      }),
    );
  }

  async unlockBoard(boardId: string, unlockedBy: string, correlationId?: string) {
    return this.commandBus.execute(
      new UnlockBoardCommand({
        boardId,
        unlockedBy,
        correlationId,
      }),
    );
  }

  async importContent(
    targetBoardId: string,
    dto: ImportContentDto,
    importedBy: string,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new ImportBoardContentCommand({
        targetBoardId,
        sourceBoardId: dto.sourceBoardId,
        importedBy,
        correlationId,
      }),
    );
  }

  async listQuestions(boardId: string) {
    return this.queryBus.execute(new ListBoardQuestionsQuery(boardId));
  }

  async attachQuestion(
    boardId: string,
    dto: AttachQuestionDto,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new AttachBoardQuestionCommand({
        boardId,
        questionId: dto.questionId,
        position: dto.position,
        mode: dto.mode,
        maxMarks: dto.maxMarks,
        showOptions: dto.showOptions,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        correlationId,
      }),
    );
  }

  async removeQuestion(
    boardId: string,
    boardQuestionId: string,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new RemoveBoardQuestionCommand({
        boardId,
        boardQuestionId,
        correlationId,
      }),
    );
  }

  async addSection(
    boardId: string,
    dto: AddSectionDto,
    createdBy: string,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new AddBoardSectionCommand({
        boardId,
        type: dto.type,
        content: dto.content,
        position: dto.position,
        createdBy,
        isTeacherOnly: dto.isTeacherOnly,
        correlationId,
      }),
    );
  }

  async updateSection(
    boardId: string,
    sectionId: string,
    dto: UpdateSectionDto,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new UpdateBoardSectionCommand({
        boardId,
        sectionId,
        content: dto.content,
        correlationId,
      }),
    );
  }

  async removeSection(
    boardId: string,
    sectionId: string,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new RemoveBoardSectionCommand({
        boardId,
        sectionId,
        correlationId,
      }),
    );
  }

  async submitResponse(
    boardQuestionId: string,
    studentId: string,
    dto: SubmitResponseDto,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new SubmitStudentResponseCommand({
        boardQuestionId,
        studentId,
        responseType: dto.responseType,
        textContent: dto.textContent,
        imageUrl: dto.imageUrl,
        selectedOption: dto.selectedOption,
        correlationId,
      }),
    );
  }

  async listResponses(boardQuestionId: string) {
    return this.queryBus.execute(
      new ListStudentResponsesQuery(boardQuestionId),
    );
  }

  async getResponse(boardQuestionId: string, studentId: string) {
    return this.queryBus.execute(
      new GetStudentResponseQuery(boardQuestionId, studentId),
    );
  }

  async markResponse(
    responseId: string,
    teacherId: string,
    dto: MarkResponseDto,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new MarkStudentResponseCommand({
        responseId,
        marksAwarded: dto.marksAwarded,
        maxMarks: dto.maxMarks,
        markedBy: teacherId,
        feedback: dto.feedback,
        correlationId,
      }),
    );
  }

  async getUploadUrl(boardId: string, dto: GetUploadUrlDto) {
    return this.storageService.getUploadUrl(boardId, dto.filename, dto.contentType);
  }

  async saveCanvasState(boardId: string, dto: SaveCanvasStateDto) {
    return this.commandBus.execute(
      new SaveCanvasStateCommand({
        boardId,
        canvasState: {
          strokes: Array.isArray(dto.strokes) ? dto.strokes : [],
          surfaceStyle: dto.surfaceStyle,
          boardBgColor: dto.boardBgColor,
          notebookWidthMode: dto.notebookWidthMode,
          notebookPages: dto.notebookPages,
        },
      }),
    );
  }
}
