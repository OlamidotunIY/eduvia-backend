import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';
import { ClassroomService } from '../services/classroom.service';
import {
  CreateClassroomDto,
  UpdateClassroomDto,
  AddStudentDto,
  ScheduleLessonDto,
  CancelLessonDto,
  AssignCoverTeacherDto,
} from '../dto';
import { LessonStatus } from '../../domain';

@Controller('organizations/:organizationId')
@UseGuards(AuthGuard)
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post('classrooms')
  async createClassroom(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateClassroomDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.createClassroom(
      organizationId,
      dto,
      correlationId,
    );
  }

  @Get('classrooms')
  async listClassrooms(
    @Param('organizationId') organizationId: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.classroomService.listClassrooms(organizationId, teacherId);
  }

  @Get('classrooms/:classroomId')
  async getClassroom(
    @Param('organizationId') organizationId: string,
    @Param('classroomId') classroomId: string,
  ) {
    return this.classroomService.getClassroom(organizationId, classroomId);
  }

  @Patch('classrooms/:classroomId')
  async updateClassroom(
    @Param('organizationId') organizationId: string,
    @Param('classroomId') classroomId: string,
    @Body() dto: UpdateClassroomDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.updateClassroom(
      organizationId,
      classroomId,
      dto,
      correlationId,
    );
  }

  @Post('classrooms/:classroomId/pause')
  async pauseClassroom(
    @Param('organizationId') organizationId: string,
    @Param('classroomId') classroomId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.pauseClassroom(
      organizationId,
      classroomId,
      correlationId,
    );
  }

  @Post('classrooms/:classroomId/close')
  async closeClassroom(
    @Param('organizationId') organizationId: string,
    @Param('classroomId') classroomId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.closeClassroom(
      organizationId,
      classroomId,
      correlationId,
    );
  }

  @Post('classrooms/:classroomId/students')
  async addStudent(
    @Param('organizationId') organizationId: string,
    @Param('classroomId') classroomId: string,
    @Body() dto: AddStudentDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.enrollStudent(
      organizationId,
      classroomId,
      dto,
      correlationId,
    );
  }

  @Delete('classrooms/:classroomId/students/:studentId')
  async removeStudent(
    @Param('organizationId') organizationId: string,
    @Param('classroomId') classroomId: string,
    @Param('studentId') studentId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.removeStudent(
      organizationId,
      classroomId,
      studentId,
      correlationId,
    );
  }

  @Post('classrooms/:classroomId/schedule-lesson')
  async scheduleLesson(
    @Param('organizationId') organizationId: string,
    @Param('classroomId') classroomId: string,
    @Body() dto: ScheduleLessonDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.scheduleLesson(
      organizationId,
      classroomId,
      dto,
      correlationId,
    );
  }

  @Get('lessons')
  async listLessons(
    @Param('organizationId') organizationId: string,
    @Query('status') status?: LessonStatus,
    @Query('teacherId') teacherId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.classroomService.listLessons(organizationId, {
      status,
      teacherId,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get('lessons/:lessonId')
  async getLesson(
    @Param('organizationId') organizationId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.classroomService.getLesson(organizationId, lessonId);
  }

  @Post('lessons/:lessonId/start')
  async startLesson(
    @Param('organizationId') organizationId: string,
    @Param('lessonId') lessonId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.startLesson(
      organizationId,
      lessonId,
      correlationId,
    );
  }

  @Post('lessons/:lessonId/complete')
  async completeLesson(
    @Param('organizationId') organizationId: string,
    @Param('lessonId') lessonId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.completeLesson(
      organizationId,
      lessonId,
      correlationId,
    );
  }

  @Post('lessons/:lessonId/cancel')
  async cancelLesson(
    @Param('organizationId') organizationId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: CancelLessonDto,
    @CurrentUser() currentUser: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.cancelLesson(
      organizationId,
      lessonId,
      dto,
      currentUser.userId,
      correlationId,
    );
  }

  @Post('lessons/:lessonId/student-no-show')
  async markStudentNoShow(
    @Param('organizationId') organizationId: string,
    @Param('lessonId') lessonId: string,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.markStudentNoShow(
      organizationId,
      lessonId,
      correlationId,
    );
  }

  @Post('lessons/:lessonId/teacher-no-show')
  async markTeacherNoShow(
    @Param('organizationId') organizationId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.markTeacherNoShow(
      organizationId,
      lessonId,
      currentUser.userId,
      correlationId,
    );
  }

  @Post('lessons/:lessonId/cover-teacher')
  async assignCoverTeacher(
    @Param('organizationId') organizationId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: AssignCoverTeacherDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.classroomService.assignCoverTeacher(
      organizationId,
      lessonId,
      dto,
      correlationId,
    );
  }
}
