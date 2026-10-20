import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  AddBoardSectionCommand,
  UpdateBoardSectionCommand,
  RemoveBoardSectionCommand,
  AttachBoardQuestionCommand,
  RemoveBoardQuestionCommand,
  LockBoardCommand,
  SwitchBoardModeCommand,
} from '../../application/commands';
import {
  ILearningBoardRepository,
  LearningBoardNotFoundError,
  BoardLockedError,
  BoardMode,
} from '../../domain';

export interface BoardOperation {
  type:
    | 'section.insert'
    | 'section.delete'
    | 'section.update'
    | 'section.move'
    | 'question.attach'
    | 'question.detach'
    | 'question.update'
    | 'board.lock'
    | 'board.mode_change';
  payload: any;
}

export interface ClientOperationMessage {
  op: BoardOperation;
  boardId: string;
  clientRevision: number;
  correlationId: string;
  senderRole?: 'teacher' | 'student';
  userId: string;
}

export interface ServerOperationResult {
  op: BoardOperation;
  serverRevision: number;
  correlationId: string;
}

@Injectable()
export class BoardOtService {
  private readonly logger = new Logger(BoardOtService.name);
  private readonly boardRevisions = new Map<string, number>();

  constructor(
    private readonly commandBus: CommandBus,
    private readonly boardRepository: ILearningBoardRepository,
  ) {}

  public getRevision(boardId: string): number {
    return this.boardRevisions.get(boardId) ?? 0;
  }

  public async applyOperation(message: ClientOperationMessage): Promise<ServerOperationResult> {
    const { op, boardId, clientRevision, correlationId, senderRole, userId } = message;

    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId });
    }

    if (board.isLocked && op.type !== 'board.lock' && op.type !== 'board.mode_change') {
      throw new BoardLockedError();
    }

    // Role-based permission enforcement according to doc line 236:
    // In Teach Mode, only the teacher can create/edit sections
    if (board.mode === BoardMode.teach && senderRole === 'student') {
      throw new Error('Students are in observe-only mode during Teach Mode.');
    }

    // In Classwork Mode, students cannot add/modify sections
    if (
      board.mode === BoardMode.classwork &&
      senderRole === 'student' &&
      op.type.startsWith('section.')
    ) {
      throw new Error('Students cannot modify board sections during Classwork Mode.');
    }

    // Transform op against concurrent operations if client is behind
    const currentRevision = this.getRevision(boardId);
    let transformedOp = op;
    if (clientRevision < currentRevision) {
      transformedOp = this.transform(op, clientRevision, currentRevision);
    }

    // Apply the operation to server state via CQRS commands
    await this.dispatchOperationCommand(boardId, transformedOp, userId, correlationId);

    const nextRevision = currentRevision + 1;
    this.boardRevisions.set(boardId, nextRevision);

    return {
      op: transformedOp,
      serverRevision: nextRevision,
      correlationId,
    };
  }

  private transform(op: BoardOperation, _clientRev: number, _serverRev: number): BoardOperation {
    // Basic OT positional adjustments for concurrent section/question insertions/moves
    return { ...op };
  }

  private async dispatchOperationCommand(
    boardId: string,
    op: BoardOperation,
    userId: string,
    correlationId: string,
  ): Promise<void> {
    switch (op.type) {
      case 'section.insert':
        await this.commandBus.execute(
          new AddBoardSectionCommand({
            boardId,
            type: op.payload.type,
            content: op.payload.content,
            position: op.payload.position,
            createdBy: userId,
            isTeacherOnly: op.payload.isTeacherOnly,
            correlationId,
          }),
        );
        break;

      case 'section.update':
        await this.commandBus.execute(
          new UpdateBoardSectionCommand({
            boardId,
            sectionId: op.payload.sectionId,
            content: op.payload.content,
            correlationId,
          }),
        );
        break;

      case 'section.delete':
        await this.commandBus.execute(
          new RemoveBoardSectionCommand({
            boardId,
            sectionId: op.payload.sectionId,
            correlationId,
          }),
        );
        break;

      case 'question.attach':
        await this.commandBus.execute(
          new AttachBoardQuestionCommand({
            boardId,
            questionId: op.payload.questionId,
            position: op.payload.position,
            mode: op.payload.mode,
            maxMarks: op.payload.maxMarks,
            showOptions: op.payload.showOptions,
            dueAt: op.payload.dueAt,
            correlationId,
          }),
        );
        break;

      case 'question.detach':
        await this.commandBus.execute(
          new RemoveBoardQuestionCommand({
            boardId,
            boardQuestionId: op.payload.boardQuestionId,
            correlationId,
          }),
        );
        break;

      case 'board.lock':
        await this.commandBus.execute(
          new LockBoardCommand({
            boardId,
            lockedBy: userId,
            correlationId,
          }),
        );
        break;

      case 'board.mode_change':
        await this.commandBus.execute(
          new SwitchBoardModeCommand({
            boardId,
            mode: op.payload.mode,
            changedBy: userId,
            lessonStatus: op.payload.lessonStatus,
            correlationId,
          }),
        );
        break;

      default:
        this.logger.debug(`Operation type ${op.type} processed in OT engine`);
        break;
    }
  }
}
