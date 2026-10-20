import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateClassroomCommand,
  CreateClassroomResult,
  PauseClassroomCommand,
  CloseClassroomCommand,
  UpdateClassroomCommand,
  EnrollStudentCommand,
  RemoveStudentCommand,
  ScheduleLessonCommand,
  StartLessonCommand,
  CompleteLessonCommand,
  CancelLessonCommand,
  MarkStudentNoShowCommand,
  MarkTeacherNoShowCommand,
  AssignCoverTeacherCommand,
} from '../../application/commands';
import {
  GetClassroomByIdQuery,
  ListClassroomsQuery,
  GetLessonByIdQuery,
  ListLessonsQuery,
  ClassroomDto,
  LessonDto,
} from '../../application/queries';
import {
  CreateClassroomDto,
  UpdateClassroomDto,
  AddStudentDto,
  ScheduleLessonDto,
  CancelLessonDto,
  AssignCoverTeacherDto,
} from '../dto';
import { LessonFilters } from '../../domain';

@Injectable()
export class ClassroomService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createClassroom(
    orgId: string,
    dto: CreateClassroomDto,
    correlationId?: string,
  ): Promise<CreateClassroomResult> {
    return this.commandBus.execute(
      new CreateClassroomCommand({
        orgId,
        name: dto.name,
        subjectId: dto.subjectId,
        primaryTeacherId: dto.primaryTeacherId,
        lessonDurationMins: dto.lessonDurationMins,
        maxStudents: dto.maxStudents,
        recurrenceDayOfWeek: dto.recurrenceDayOfWeek,
        recurrenceStartTime: dto.recurrenceStartTime,
        recurrenceTimezone: dto.recurrenceTimezone,
        recurrenceIntervalWeeks: dto.recurrenceIntervalWeeks,
        recurrenceEffectiveFrom: new Date(dto.recurrenceEffectiveFrom),
        recurrenceEffectiveUntil: dto.recurrenceEffectiveUntil
          ? new Date(dto.recurrenceEffectiveUntil)
          : null,
        correlationId,
      }),
    );
  }

  async listClassrooms(
    orgId: string,
    teacherId?: string,
  ): Promise<ClassroomDto[]> {
    return this.queryBus.execute(new ListClassroomsQuery(orgId, teacherId));
  }

  async getClassroom(
    orgId: string,
    classroomId: string,
  ): Promise<ClassroomDto> {
    return this.queryBus.execute(new GetClassroomByIdQuery(classroomId, orgId));
  }

  async updateClassroom(
    orgId: string,
    classroomId: string,
    dto: UpdateClassroomDto,
    correlationId?: string,
  ): Promise<{ success: boolean }> {
    return this.commandBus.execute(
      new UpdateClassroomCommand({
        classroomId,
        orgId,
        name: dto.name,
        lessonDurationMins: dto.lessonDurationMins,
        maxStudents: dto.maxStudents,
        primaryTeacherId: dto.primaryTeacherId,
        correlationId,
      }),
    );
  }

  async pauseClassroom(
    orgId: string,
    classroomId: string,
    correlationId?: string,
  ): Promise<{ success: boolean }> {
    return this.commandBus.execute(
      new PauseClassroomCommand({
        classroomId,
        orgId,
        correlationId,
      }),
    );
  }

  async closeClassroom(
    orgId: string,
    classroomId: string,
    correlationId?: string,
  ): Promise<{ success: boolean }> {
    return this.commandBus.execute(
      new CloseClassroomCommand({
        classroomId,
        orgId,
        correlationId,
      }),
    );
  }

  async enrollStudent(
    orgId: string,
    classroomId: string,
    dto: AddStudentDto,
    correlationId?: string,
  ): Promise<{ id: string }> {
    return this.commandBus.execute(
      new EnrollStudentCommand({
        classroomId,
        studentId: dto.studentId,
        orgId,
        correlationId,
      }),
    );
  }

  async removeStudent(
    orgId: string,
    classroomId: string,
    studentId: string,
    correlationId?: string,
  ): Promise<{ success: boolean }> {
    return this.commandBus.execute(
      new RemoveStudentCommand({
        classroomId,
        studentId,
        orgId,
        correlationId,
      }),
    );
  }

  async listLessons(
    orgId: string,
    filters?: LessonFilters,
  ): Promise<LessonDto[]> {
    return this.queryBus.execute(new ListLessonsQuery(orgId, filters));
  }

  async getLesson(orgId: string, lessonId: string): Promise<LessonDto> {
    return this.queryBus.execute(new GetLessonByIdQuery(lessonId, orgId));
  }

  async scheduleLesson(
    orgId: string,
    classroomId: string,
    dto: ScheduleLessonDto,
    correlationId?: string,
  ): Promise<{ id: string }> {
    return this.commandBus.execute(
      new ScheduleLessonCommand({
        classroomId,
        orgId,
        scheduledAt: new Date(dto.scheduledAt),
        durationMins: dto.durationMins,
        teacherId: dto.teacherId,
        isRecurring: dto.isRecurring,
        correlationId,
      }),
    );
  }

  async startLesson(
    orgId: string,
    lessonId: string,
    correlationId?: string,
  ): Promise<{ success: boolean; meetLink: string | null }> {
    return this.commandBus.execute(
      new StartLessonCommand({
        lessonId,
        orgId,
        correlationId,
      }),
    );
  }

  async completeLesson(
    orgId: string,
    lessonId: string,
    correlationId?: string,
  ): Promise<{ success: boolean }> {
    return this.commandBus.execute(
      new CompleteLessonCommand({
        lessonId,
        orgId,
        correlationId,
      }),
    );
  }

  async cancelLesson(
    orgId: string,
    lessonId: string,
    dto: CancelLessonDto,
    cancelledBy: string,
    correlationId?: string,
  ): Promise<{ success: boolean }> {
    return this.commandBus.execute(
      new CancelLessonCommand({
        lessonId,
        orgId,
        reason: dto.reason,
        cancelledBy,
        correlationId,
      }),
    );
  }

  async markStudentNoShow(
    orgId: string,
    lessonId: string,
    correlationId?: string,
  ): Promise<{ success: boolean }> {
    return this.commandBus.execute(
      new MarkStudentNoShowCommand({
        lessonId,
        orgId,
        correlationId,
      }),
    );
  }

  async markTeacherNoShow(
    orgId: string,
    lessonId: string,
    markedBy: string,
    correlationId?: string,
  ): Promise<{ success: boolean }> {
    return this.commandBus.execute(
      new MarkTeacherNoShowCommand({
        lessonId,
        orgId,
        markedBy,
        correlationId,
      }),
    );
  }

  async assignCoverTeacher(
    orgId: string,
    lessonId: string,
    dto: AssignCoverTeacherDto,
    correlationId?: string,
  ): Promise<{ success: boolean }> {
    return this.commandBus.execute(
      new AssignCoverTeacherCommand({
        lessonId,
        orgId,
        coverTeacherId: dto.coverTeacherId,
        correlationId,
      }),
    );
  }
}
