import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateQuestionCommand,
  PublishQuestionCommand,
  UnpublishQuestionCommand,
  UpdateQuestionContentCommand,
  CreateAssessmentCommand,
  ApplyTeacherMarkCommand,
  FinalizeAssessmentCommand,
  ApplyMasteryOverrideCommand,
} from '../../application/commands';
import {
  GetQuestionByIdQuery,
  SearchQuestionsQuery,
  GetAssessmentByIdQuery,
  ListAssessmentsQuery,
  GetStudentMasteryQuery,
  GetAssessmentSummaryQuery,
} from '../../application/queries';
import { AssessmentFilter } from '../../domain';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  SearchQuestionsDto,
  CreateAssessmentDto,
  ApplyTeacherMarkDto,
  ApplyMasteryOverrideDto,
} from '../dto';

@Injectable()
export class AssessmentService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createQuestion(dto: CreateQuestionDto, correlationId?: string) {
    return this.commandBus.execute(
      new CreateQuestionCommand({
        ownerType: dto.ownerType,
        ownerId: dto.ownerId,
        orgId: dto.orgId,
        type: dto.type,
        stem: dto.stem,
        options: dto.options,
        correctOptionKey: dto.correctOptionKey,
        markScheme: dto.markScheme,
        maxMarks: dto.maxMarks,
        difficultyLevel: dto.difficultyLevel,
        subject: dto.subject,
        curriculumNodeId: dto.curriculumNodeId,
        examBoard: dto.examBoard,
        yearGroup: dto.yearGroup,
        tags: dto.tags,
        provenance: dto.provenance,
        correlationId,
      }),
    );
  }

  async getQuestion(id: string) {
    return this.queryBus.execute(new GetQuestionByIdQuery(id));
  }

  async searchQuestions(dto: SearchQuestionsDto, user?: { orgId?: string; userId?: string }) {
    const { skip, take, ...filter } = dto;
    return this.queryBus.execute(
      new SearchQuestionsQuery(
        filter,
        user?.orgId,
        user?.userId,
        skip !== undefined || take !== undefined ? { skip, take } : undefined,
      ),
    );
  }

  async updateQuestion(
    id: string,
    dto: UpdateQuestionDto,
    user?: { role: string; userId?: string; orgId?: string },
  ) {
    return this.commandBus.execute(
      new UpdateQuestionContentCommand({
        questionId: id,
        stem: dto.stem,
        options: dto.options,
        correctOptionKey: dto.correctOptionKey,
        markScheme: dto.markScheme,
        maxMarks: dto.maxMarks,
        actor: user,
      }),
    );
  }

  async publishQuestion(id: string, correlationId?: string) {
    return this.commandBus.execute(
      new PublishQuestionCommand({
        questionId: id,
        correlationId,
      }),
    );
  }

  async unpublishQuestion(id: string) {
    return this.commandBus.execute(
      new UnpublishQuestionCommand({
        questionId: id,
      }),
    );
  }

  async createAssessment(
    orgId: string,
    dto: CreateAssessmentDto,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new CreateAssessmentCommand({
        orgId,
        lessonId: dto.lessonId,
        boardId: dto.boardId,
        studentId: dto.studentId,
        correlationId,
      }),
    );
  }

  async listAssessments(
    orgId: string,
    filter?: AssessmentFilter,
    pagination?: { skip?: number; take?: number },
  ) {
    return this.queryBus.execute(
      new ListAssessmentsQuery(orgId, filter, pagination),
    );
  }

  async getAssessmentSummary(orgId: string, filter?: AssessmentFilter) {
    return this.queryBus.execute(
      new GetAssessmentSummaryQuery({ orgId, filter }),
    );
  }

  async getAssessment(id: string, orgId?: string) {
    return this.queryBus.execute(new GetAssessmentByIdQuery(id, orgId));
  }

  async applyTeacherMark(
    orgId: string,
    assessmentId: string,
    markingItemId: string,
    dto: ApplyTeacherMarkDto,
    teacherId: string,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new ApplyTeacherMarkCommand({
        orgId,
        assessmentId,
        markingItemId,
        marksAwarded: dto.marksAwarded,
        teacherId,
        feedback: dto.feedback,
        correlationId,
      }),
    );
  }

  async finalizeAssessment(
    orgId: string,
    assessmentId: string,
    curriculumNodeId?: string | null,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new FinalizeAssessmentCommand({
        orgId,
        assessmentId,
        curriculumNodeId,
        correlationId,
      }),
    );
  }

  async getStudentMastery(
    studentId: string,
    orgId?: string,
    curriculumNodeId?: string,
  ) {
    return this.queryBus.execute(
      new GetStudentMasteryQuery(studentId, orgId, curriculumNodeId),
    );
  }

  async applyMasteryOverride(
    studentId: string,
    curriculumNodeId: string,
    orgId: string,
    dto: ApplyMasteryOverrideDto,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new ApplyMasteryOverrideCommand({
        studentId,
        curriculumNodeId,
        orgId,
        score: dto.score,
        correlationId,
      }),
    );
  }
}
