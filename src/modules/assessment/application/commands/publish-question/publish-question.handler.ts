import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PublishQuestionCommand } from './publish-question.command';
import { PublishQuestionResult } from './publish-question.result';
import {
  IQuestionRepository,
  QuestionNotFoundError,
} from '../../../domain';

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionHandler
  implements ICommandHandler<PublishQuestionCommand, PublishQuestionResult>
{
  constructor(private readonly questionRepository: IQuestionRepository) {}

  async execute(command: PublishQuestionCommand): Promise<PublishQuestionResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const question = await this.questionRepository.findById(payload.questionId);
    if (!question) {
      throw new QuestionNotFoundError(payload.questionId);
    }

    question.publish(correlationId);
    await this.questionRepository.save(question);

    return {
      id: question.id.unpack(),
      isPublished: question.isPublished,
    };
  }
}
