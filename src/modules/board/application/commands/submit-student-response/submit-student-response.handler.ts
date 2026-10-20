import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubmitStudentResponseCommand } from './submit-student-response.command';
import { SubmitStudentResponseResult } from './submit-student-response.result';
import {
  IBoardQuestionRepository,
  IStudentResponseRepository,
  BoardQuestionNotFoundError,
  DuplicateStudentResponseError,
  StudentResponse,
  ResponseType,
  AutoMarkResult,
} from '../../../domain';

@CommandHandler(SubmitStudentResponseCommand)
export class SubmitStudentResponseHandler
  implements ICommandHandler<SubmitStudentResponseCommand, SubmitStudentResponseResult>
{
  constructor(
    private readonly questionRepository: IBoardQuestionRepository,
    private readonly responseRepository: IStudentResponseRepository,
  ) {}

  async execute(command: SubmitStudentResponseCommand): Promise<SubmitStudentResponseResult> {
    const { payload } = command;

    const question = await this.questionRepository.findById(payload.boardQuestionId);
    if (!question) {
      throw new BoardQuestionNotFoundError({ boardQuestionId: payload.boardQuestionId });
    }

    const existing = await this.responseRepository.findByQuestionAndStudent(
      payload.boardQuestionId,
      payload.studentId,
    );
    if (existing) {
      throw new DuplicateStudentResponseError({
        boardQuestionId: payload.boardQuestionId,
        studentId: payload.studentId,
      });
    }

    let autoMarkResult: AutoMarkResult | null = null;
    // Auto-mark MCQ if options are shown and choice is provided
    if (payload.responseType === ResponseType.mcq_choice && question.showOptions && payload.selectedOption) {
      // In MCQ, full marks for answered choice when auto-marked
      autoMarkResult = AutoMarkResult.create(true, question.maxMarks);
    }

    const response = StudentResponse.create({
      boardQuestionId: question.id.unpack(),
      studentId: payload.studentId,
      responseType: payload.responseType,
      textContent: payload.textContent,
      imageUrl: payload.imageUrl,
      selectedOption: payload.selectedOption,
      autoMarkResult,
    });

    question.addResponse(response);
    await this.responseRepository.save(response);
    await this.questionRepository.save(question);

    return {
      id: response.id.unpack(),
      boardQuestionId: question.id.unpack(),
      studentId: response.studentId,
      submittedAt: response.submittedAt,
      autoMarked: autoMarkResult !== null,
      marksAwarded: autoMarkResult ? autoMarkResult.marksAwarded : null,
    };
  }
}
