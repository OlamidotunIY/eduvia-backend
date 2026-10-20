import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateCurriculumProfileDto,
  UpdateCurriculumProfileDto,
  CreateCurriculumNodeDto,
  UpdateCurriculumNodeDto,
  CreatePlatformSubjectDto,
  CreateSubjectCurriculumMappingDto,
} from '../dto';
import {
  CreateCurriculumProfileCommand,
  UpdateCurriculumProfileCommand,
  ActivateCurriculumProfileCommand,
  DeactivateCurriculumProfileCommand,
  CreateCurriculumNodeCommand,
  UpdateCurriculumNodeCommand,
  DeactivateCurriculumNodeCommand,
  CreatePlatformSubjectCommand,
  CreateSubjectCurriculumMappingCommand,
} from '../../application/commands';
import {
  ListCurriculaQuery,
  GetCurriculumByIdQuery,
  GetCurriculumTreeQuery,
  ListCurriculumNodesQuery,
  GetCurriculumNodeByIdQuery,
  SearchCurriculumNodesQuery,
  ListPlatformSubjectsQuery,
  ResolveStudentCurriculumQuery,
} from '../../application/queries';

@Injectable()
export class CurriculumService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  public async listCurricula(filter?: { countryCode?: string; isActive?: boolean }) {
    return this.queryBus.execute(new ListCurriculaQuery(filter));
  }

  public async getCurriculum(id: string) {
    return this.queryBus.execute(new GetCurriculumByIdQuery(id));
  }

  public async getCurriculumTree(id: string) {
    return this.queryBus.execute(new GetCurriculumTreeQuery(id));
  }

  public async createCurriculum(dto: CreateCurriculumProfileDto, correlationId?: string) {
    return this.commandBus.execute(
      new CreateCurriculumProfileCommand({
        ...dto,
        correlationId,
      }),
    );
  }

  public async updateCurriculum(id: string, dto: UpdateCurriculumProfileDto) {
    return this.commandBus.execute(
      new UpdateCurriculumProfileCommand({
        id,
        ...dto,
      }),
    );
  }

  public async activateCurriculum(id: string) {
    return this.commandBus.execute(
      new ActivateCurriculumProfileCommand({ id }),
    );
  }

  public async deactivateCurriculum(id: string) {
    return this.commandBus.execute(
      new DeactivateCurriculumProfileCommand({ id }),
    );
  }

  public async listNodes(curriculumId: string, depth?: number) {
    return this.queryBus.execute(new ListCurriculumNodesQuery(curriculumId, depth));
  }

  public async getNode(nodeId: string) {
    return this.queryBus.execute(new GetCurriculumNodeByIdQuery(nodeId));
  }

  public async searchNodes(query: string, curriculumId?: string) {
    return this.queryBus.execute(new SearchCurriculumNodesQuery(query, curriculumId));
  }

  public async createNode(
    curriculumId: string,
    dto: CreateCurriculumNodeDto,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new CreateCurriculumNodeCommand({
        curriculumId,
        parentNodeId: dto.parentNodeId,
        nodeType: dto.nodeType,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        gradeLevel: dto.gradeLevel,
        isActive: dto.isActive,
        correlationId,
      }),
    );
  }

  public async updateNode(
    nodeId: string,
    dto: UpdateCurriculumNodeDto,
    correlationId?: string,
  ) {
    return this.commandBus.execute(
      new UpdateCurriculumNodeCommand({
        id: nodeId,
        ...dto,
        correlationId,
      }),
    );
  }

  public async deactivateNode(nodeId: string, correlationId?: string) {
    return this.commandBus.execute(
      new DeactivateCurriculumNodeCommand({
        id: nodeId,
        correlationId,
      }),
    );
  }

  public async listPlatformSubjects(activeOnly?: boolean) {
    return this.queryBus.execute(new ListPlatformSubjectsQuery(activeOnly));
  }

  public async createPlatformSubject(dto: CreatePlatformSubjectDto) {
    return this.commandBus.execute(
      new CreatePlatformSubjectCommand(dto),
    );
  }

  public async createSubjectCurriculumMapping(
    platformSubjectId: string,
    dto: CreateSubjectCurriculumMappingDto,
  ) {
    return this.commandBus.execute(
      new CreateSubjectCurriculumMappingCommand({
        platformSubjectId,
        curriculumId: dto.curriculumId,
        subjectNodeId: dto.subjectNodeId,
      }),
    );
  }

  public async resolveStudentCurriculum(countryCode: string) {
    return this.queryBus.execute(new ResolveStudentCurriculumQuery(countryCode));
  }
}
