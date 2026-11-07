import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Optional } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { IBoardQueryPort } from '@modules/shared';
import { CreateAssessmentCommand } from '../../../application/commands';
import { IAssessmentRepository } from '../../../domain';

@Processor('assessment-events')
export class AssessmentSubmissionProcessor extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly assessmentRepository: IAssessmentRepository,
    @Optional()
    @Inject(IBoardQueryPort)
    private readonly boardQueryPort?: IBoardQueryPort,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name !== 'StudentResponseSubmittedEvent' || !this.boardQueryPort) {
      return;
    }

    const { boardId, studentId } = job.data.payload;
    const board = await this.boardQueryPort.getBoardById(boardId);
    if (!board || board.mode !== 'assignment') return;

    const assignmentQuestionIds = (await this.boardQueryPort.getBoardQuestions(
      board.id,
    ))
      .filter((question) => question.mode === 'assignment')
      .map((question) => question.id);
    if (assignmentQuestionIds.length === 0) return;

    const submittedQuestionIds = new Set(
      (await this.boardQueryPort.getStudentResponsesByBoardId(board.id))
        .filter((response) => response.studentId === studentId)
        .map((response) => response.boardQuestionId),
    );
    if (!assignmentQuestionIds.every((id) => submittedQuestionIds.has(id))) {
      return;
    }

    const existing = await this.assessmentRepository.findByLessonAndStudent(
      board.lessonId,
      studentId,
    );
    if (existing) return;

    await this.commandBus.execute(
      new CreateAssessmentCommand({
        orgId: board.orgId,
        lessonId: board.lessonId,
        boardId: board.id,
        studentId,
        correlationId: job.data.correlationId,
      }),
    );
  }
}
