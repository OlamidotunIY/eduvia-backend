import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuestionCommand } from './create-question.command';
import { CreateQuestionResult } from './create-question.result';
import {
  Question,
  QuestionProvenance,
  IQuestionRepository,
} from '../../../domain';

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionHandler
  implements ICommandHandler<CreateQuestionCommand, CreateQuestionResult>
{
  constructor(private readonly questionRepository: IQuestionRepository) {}

  async execute(command: CreateQuestionCommand): Promise<CreateQuestionResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const provenance = QuestionProvenance.create({
      source: payload.provenance.source,
      createdBy: payload.provenance.createdBy,
      aiModel: payload.provenance.aiModel,
      licenseRef: payload.provenance.licenseRef,
      paperRef: payload.provenance.paperRef,
    });

    const question = Question.create(
      {
        ownerType: payload.ownerType,
        ownerId: payload.ownerId,
        orgId: payload.orgId,
        type: payload.type,
        stem: payload.stem,
        options: payload.options,
        correctOptionKey: payload.correctOptionKey,
        markScheme: payload.markScheme,
        maxMarks: payload.maxMarks,
        difficultyLevel: payload.difficultyLevel,
        subject: payload.subject,
        curriculumNodeId: payload.curriculumNodeId,
        examBoard: payload.examBoard,
        yearGroup: payload.yearGroup,
        tags: payload.tags,
        provenance,
        isPublished: payload.isPublished,
      },
      correlationId,
    );

    await this.questionRepository.save(question);

    return {
      id: question.id.unpack(),
    };
  }
}
