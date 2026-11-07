import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteQuestionCommand } from './delete-question.command';
import { DeleteQuestionResult } from './delete-question.result';
import {
  IQuestionRepository,
  QuestionNotFoundError,
} from '../../../domain';

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionHandler
  implements ICommandHandler<DeleteQuestionCommand, DeleteQuestionResult>
{
  constructor(private readonly questionRepository: IQuestionRepository) {}

  async execute(command: DeleteQuestionCommand): Promise<DeleteQuestionResult> {
    const { payload } = command;

    const question = await this.questionRepository.findById(payload.questionId);
    if (!question) {
      throw new QuestionNotFoundError(payload.questionId);
    }

    question.delete(payload.actor);
    await this.questionRepository.delete(payload.questionId);

    return {
      id: question.id.unpack(),
      success: true,
    };
  }
}
