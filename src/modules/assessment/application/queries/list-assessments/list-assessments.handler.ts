import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListAssessmentsQuery } from './list-assessments.query';
import { ListAssessmentsDto } from './list-assessments.dto';
import { IAssessmentRepository } from '../../../domain';
import { IQuestionRepository } from '../../../domain';
import {
  IBoardQueryPort,
  IClassroomQueryPort,
  IUserQueryPort,
} from '@modules/shared';
import { Inject } from '@nestjs/common';
import { AssessmentDetailPresenter } from '../assessment-detail.presenter';

@QueryHandler(ListAssessmentsQuery)
export class ListAssessmentsHandler
  implements IQueryHandler<ListAssessmentsQuery, ListAssessmentsDto>
{
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    @Inject(IQuestionRepository)
    private readonly questionRepository: IQuestionRepository,
    @Inject(IBoardQueryPort)
    private readonly boardQueryPort: IBoardQueryPort,
    @Inject(IClassroomQueryPort)
    private readonly classroomQueryPort: IClassroomQueryPort,
    @Inject(IUserQueryPort)
    private readonly userQueryPort: IUserQueryPort,
  ) {}

  async execute(query: ListAssessmentsQuery): Promise<ListAssessmentsDto> {
    const assessments = await this.assessmentRepository.findByOrgId(
      query.orgId,
      query.filter,
      query.pagination,
    );

    return {
      items: await Promise.all(
        assessments.map((assessment) =>
          new AssessmentDetailPresenter(
            this.questionRepository,
            this.boardQueryPort,
            this.classroomQueryPort,
            this.userQueryPort,
          ).present(assessment),
        ),
      ),
      total: assessments.length,
    };
  }
}
