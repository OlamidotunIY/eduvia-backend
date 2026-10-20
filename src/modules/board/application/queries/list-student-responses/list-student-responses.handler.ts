import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListStudentResponsesQuery } from './list-student-responses.query';
import { StudentResponseDto } from './list-student-responses.dto';
import { IStudentResponseRepository } from '../../../domain';

@QueryHandler(ListStudentResponsesQuery)
export class ListStudentResponsesHandler
  implements IQueryHandler<ListStudentResponsesQuery, StudentResponseDto[]>
{
  constructor(private readonly responseRepository: IStudentResponseRepository) {}

  async execute(query: ListStudentResponsesQuery): Promise<StudentResponseDto[]> {
    const responses = await this.responseRepository.findByBoardQuestionId(
      query.boardQuestionId,
    );

    return responses.map((r) => ({
      id: r.id.unpack(),
      boardQuestionId: r.boardQuestionId,
      studentId: r.studentId,
      responseType: r.responseType,
      textContent: r.textContent ?? null,
      imageUrl: r.imageUrl ?? null,
      selectedOption: r.selectedOption ?? null,
      submittedAt: r.submittedAt,
      autoMarkResult: r.autoMarkResult ? r.autoMarkResult.toJSON() : null,
      teacherMark: r.teacherMark ? r.teacherMark.toJSON() : null,
    }));
  }
}
