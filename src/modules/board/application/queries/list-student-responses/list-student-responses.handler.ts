import { Optional } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@modules/shared';
import { ListStudentResponsesQuery } from './list-student-responses.query';
import { StudentResponseDto } from './list-student-responses.dto';
import { IStudentResponseRepository } from '../../../domain';

@QueryHandler(ListStudentResponsesQuery)
export class ListStudentResponsesHandler
  implements IQueryHandler<ListStudentResponsesQuery, StudentResponseDto[]>
{
  constructor(
    private readonly responseRepository: IStudentResponseRepository,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async execute(query: ListStudentResponsesQuery): Promise<StudentResponseDto[]> {
    const responses = await this.responseRepository.findByBoardQuestionId(
      query.boardQuestionId,
    );

    const userMap = new Map<
      string,
      { firstName: string; lastName: string; email: string; image: string | null }
    >();
    if (this.prisma && responses.length > 0) {
      const studentIds = [...new Set(responses.map((r) => r.studentId))];
      const users = await this.prisma.user.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, firstName: true, lastName: true, email: true, image: true },
      });
      for (const u of users) {
        userMap.set(u.id, u);
      }
    }

    return responses.map((r) => {
      const user = userMap.get(r.studentId);
      const studentName = user ? `${user.firstName} ${user.lastName}`.trim() : null;
      return {
        id: r.id.unpack(),
        boardQuestionId: r.boardQuestionId,
        studentId: r.studentId,
        studentName: studentName || null,
        studentEmail: user?.email ?? null,
        studentImage: user?.image ?? null,
        responseType: r.responseType,
        textContent: r.textContent ?? null,
        imageUrl: r.imageUrl ?? null,
        selectedOption: r.selectedOption ?? null,
        submittedAt: r.submittedAt,
        autoMarkResult: r.autoMarkResult ? r.autoMarkResult.toJSON() : null,
        teacherMark: r.teacherMark ? r.teacherMark.toJSON() : null,
      };
    });
  }
}
