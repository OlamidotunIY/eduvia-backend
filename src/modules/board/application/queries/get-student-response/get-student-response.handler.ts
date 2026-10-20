import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStudentResponseQuery } from './get-student-response.query';
import { StudentResponseDto } from './get-student-response.dto';
import {
  IStudentResponseRepository,
  StudentResponseNotFoundError,
} from '../../../domain';

@QueryHandler(GetStudentResponseQuery)
export class GetStudentResponseHandler
  implements IQueryHandler<GetStudentResponseQuery, StudentResponseDto>
{
  constructor(private readonly responseRepository: IStudentResponseRepository) {}

  async execute(query: GetStudentResponseQuery): Promise<StudentResponseDto> {
    const response = await this.responseRepository.findByQuestionAndStudent(
      query.boardQuestionId,
      query.studentId,
    );

    if (!response) {
      throw new StudentResponseNotFoundError({
        boardQuestionId: query.boardQuestionId,
        studentId: query.studentId,
      });
    }

    return {
      id: response.id.unpack(),
      boardQuestionId: response.boardQuestionId,
      studentId: response.studentId,
      responseType: response.responseType,
      textContent: response.textContent ?? null,
      imageUrl: response.imageUrl ?? null,
      selectedOption: response.selectedOption ?? null,
      submittedAt: response.submittedAt,
      autoMarkResult: response.autoMarkResult ? response.autoMarkResult.toJSON() : null,
      teacherMark: response.teacherMark ? response.teacherMark.toJSON() : null,
    };
  }
}
