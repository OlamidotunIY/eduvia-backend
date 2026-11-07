import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAssessmentByIdQuery } from './get-assessment-by-id.query';
import { AssessmentDetailDto } from './get-assessment-by-id.dto';
import {
  IAssessmentRepository,
  AssessmentNotFoundError,
} from '../../../domain';
import {
  IBoardQueryPort,
  IClassroomQueryPort,
  IUserQueryPort,
} from '@modules/shared';
import { Inject } from '@nestjs/common';
import { AssessmentDetailPresenter } from '../assessment-detail.presenter';

@QueryHandler(GetAssessmentByIdQuery)
export class GetAssessmentByIdHandler
  implements IQueryHandler<GetAssessmentByIdQuery, AssessmentDetailDto>
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

  async execute(query: GetAssessmentByIdQuery): Promise<AssessmentDetailDto> {
    const assessment = await this.assessmentRepository.findById(
      query.assessmentId,
    );
    if (!assessment) {
      throw new AssessmentNotFoundError(query.assessmentId);
    }
    if (query.orgId && assessment.orgId !== query.orgId) {
      throw new AssessmentNotFoundError(query.assessmentId);
    }

    return new AssessmentDetailPresenter(
      this.questionRepository,
      this.boardQueryPort,
      this.classroomQueryPort,
      this.userQueryPort,
    ).present(assessment);
  }
}
