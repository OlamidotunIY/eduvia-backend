import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateQuestionContentCommand } from './update-question-content.command';
import { UpdateQuestionContentResult } from './update-question-content.result';
import {
  IQuestionRepository,
  QuestionNotFoundError,
} from '../../../domain';

@CommandHandler(UpdateQuestionContentCommand)
export class UpdateQuestionContentHandler
  implements
    ICommandHandler<
      UpdateQuestionContentCommand,
      UpdateQuestionContentResult
    >
{
  constructor(private readonly questionRepository: IQuestionRepository) {}

  async execute(
    command: UpdateQuestionContentCommand,
  ): Promise<UpdateQuestionContentResult> {
    const { payload } = command;

    const question = await this.questionRepository.findById(payload.questionId);
    if (!question) {
      throw new QuestionNotFoundError(payload.questionId);
    }

    question.updateContent(
      {
        stem: payload.stem,
        options: payload.options,
        correctOptionKey: payload.correctOptionKey,
        markScheme: payload.markScheme,
        maxMarks: payload.maxMarks,
      },
      payload.actor,
    );

    await this.questionRepository.save(question);

    return {
      id: question.id.unpack(),
    };
  }
}
