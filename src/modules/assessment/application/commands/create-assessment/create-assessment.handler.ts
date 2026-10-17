import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAssessmentCommand } from './create-assessment.command';
import { CreateAssessmentResult } from './create-assessment.result';
import {
  Assessment,
  MarkingItem,
  IAssessmentRepository,
} from '../../../domain';

@CommandHandler(CreateAssessmentCommand)
export class CreateAssessmentHandler
  implements ICommandHandler<CreateAssessmentCommand, CreateAssessmentResult>
{
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

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

    const markingItems = payload.items.map((item) =>
      MarkingItem.create({
        assessmentId: 'temp', // will be linked through aggregate/repository
        boardQuestionId: item.boardQuestionId,
        studentResponseId: item.studentResponseId,
        questionType: item.questionType,
        maxMarks: item.maxMarks,
        autoMarked: item.autoMarked,
        marksAwarded: item.marksAwarded,
        feedback: item.feedback,
        markedBy: item.markedBy,
        status: item.status,
      }),
    );

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
