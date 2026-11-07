import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateAssessmentCommand } from './create-assessment.command';
import { CreateAssessmentResult } from './create-assessment.result';
import {
  Assessment,
  MarkingItem,
  IAssessmentRepository,
  IQuestionRepository,
  MarkingStatus,
  QuestionType,
} from '../../../domain';
import {
  BusinessRuleViolationError,
  IBoardQueryPort,
  IClassroomQueryPort,
} from '@modules/shared';

@CommandHandler(CreateAssessmentCommand)
export class CreateAssessmentHandler
  implements ICommandHandler<CreateAssessmentCommand, CreateAssessmentResult>
{
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    @Inject(IQuestionRepository)
    private readonly questionRepository: IQuestionRepository,
    @Inject(IBoardQueryPort)
    private readonly boardQueryPort: IBoardQueryPort,
    @Inject(IClassroomQueryPort)
    private readonly classroomQueryPort: IClassroomQueryPort,
  ) {}

  async execute(
    command: CreateAssessmentCommand,
  ): Promise<CreateAssessmentResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const existing = await this.assessmentRepository.findByLessonAndStudent(
      payload.lessonId,
      payload.studentId,
    );
    if (existing) {
      return {
        id: existing.id.unpack(),
        status: existing.status,
      };
    }

    const [board, lesson] = await Promise.all([
      this.boardQueryPort.getBoardById(payload.boardId),
      this.classroomQueryPort.getLessonById(payload.lessonId),
    ]);
    if (!board || board.lessonId !== payload.lessonId || board.orgId !== payload.orgId) {
      throw new BusinessRuleViolationError(
        'Assessment board must belong to the requested lesson and organization.',
      );
    }
    if (!lesson || lesson.orgId !== payload.orgId) {
      throw new BusinessRuleViolationError(
        'Assessment lesson must belong to the requested organization.',
      );
    }
    if (
      !(await this.classroomQueryPort.isStudentEnrolled(
        lesson.classroomId,
        payload.studentId,
      ))
    ) {
      throw new BusinessRuleViolationError(
        'Assessment student must be enrolled in the lesson classroom.',
      );
    }

    const [boardQuestions, submittedResponses] = await Promise.all([
      this.boardQueryPort.getBoardQuestions(board.id),
      this.boardQueryPort.getStudentResponsesByBoardId(board.id),
    ]);
    const studentResponses = new Map(
      submittedResponses
        .filter((response) => response.studentId === payload.studentId)
        .map((response) => [response.boardQuestionId, response]),
    );
    const markingItems: MarkingItem[] = [];

    for (const boardQuestion of boardQuestions) {
      const response = studentResponses.get(boardQuestion.id);
      if (!response) continue;

      const question = await this.questionRepository.findById(
        boardQuestion.questionId,
      );
      if (!question) {
        throw new BusinessRuleViolationError(
          `Board question ${boardQuestion.id} references a missing question.`,
        );
      }

      const canAutoMark =
        question.type === QuestionType.mcq && boardQuestion.showOptions;
      const marksAwarded = canAutoMark
        ? response.selectedOption?.toUpperCase() ===
          question.correctOptionKey?.toUpperCase()
          ? boardQuestion.maxMarks
          : 0
        : null;

      markingItems.push(
        MarkingItem.create({
          assessmentId: 'temp',
          boardQuestionId: boardQuestion.id,
          studentResponseId: response.id,
          questionType: question.type,
          maxMarks: boardQuestion.maxMarks,
          autoMarked: canAutoMark,
          marksAwarded,
          status: canAutoMark
            ? MarkingStatus.auto_marked
            : MarkingStatus.pending,
        }),
      );
    }

    if (!markingItems.length) {
      throw new BusinessRuleViolationError(
        'An assessment requires at least one submitted board response.',
      );
    }

    const assessment = Assessment.create(
      {
        orgId: payload.orgId,
        lessonId: payload.lessonId,
        boardId: payload.boardId,
        studentId: payload.studentId,
        markingItems,
      },
      correlationId,
    );

    await this.assessmentRepository.save(assessment);

    return {
      id: assessment.id.unpack(),
      status: assessment.status,
    };
  }
}
