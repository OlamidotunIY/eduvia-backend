import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnpublishQuestionCommand } from './unpublish-question.command';
import { UnpublishQuestionResult } from './unpublish-question.result';
import {
  IQuestionRepository,
  QuestionNotFoundError,
} from '../../../domain';

@CommandHandler(UnpublishQuestionCommand)
export class UnpublishQuestionHandler
  implements ICommandHandler<UnpublishQuestionCommand, UnpublishQuestionResult>
{
  constructor(private readonly questionRepository: IQuestionRepository) {}

  async execute(command: UnpublishQuestionCommand): Promise<UnpublishQuestionResult> {
    const { payload } = command;

    const question = await this.questionRepository.findById(payload.questionId);
    if (!question) {
      throw new QuestionNotFoundError(payload.questionId);
    }

    question.unpublish();
    await this.questionRepository.save(question);

    return {
      id: question.id.unpack(),
      isPublished: question.isPublished,
    };
  }
}
