import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkStudentResponseCommand } from './mark-student-response.command';
import { MarkStudentResponseResult } from './mark-student-response.result';
import {
  IStudentResponseRepository,
  StudentResponseNotFoundError,
  TeacherMark,
} from '../../../domain';

@CommandHandler(MarkStudentResponseCommand)
export class MarkStudentResponseHandler
  implements ICommandHandler<MarkStudentResponseCommand, MarkStudentResponseResult>
{
  constructor(private readonly responseRepository: IStudentResponseRepository) {}

  async execute(command: MarkStudentResponseCommand): Promise<MarkStudentResponseResult> {
    const { payload } = command;

    const response = await this.responseRepository.findById(payload.responseId);
    if (!response) {
      throw new StudentResponseNotFoundError({ responseId: payload.responseId });
    }

    const teacherMark = TeacherMark.create(
      payload.marksAwarded,
      payload.maxMarks,
      payload.markedBy,
      payload.feedback,
    );

    response.setTeacherMark(teacherMark);
    await this.responseRepository.save(response);

    return {
      id: response.id.unpack(),
      marksAwarded: teacherMark.marksAwarded,
      maxMarks: teacherMark.maxMarks,
      markedBy: teacherMark.markedBy,
      markedAt: teacherMark.markedAt,
    };
  }
}
