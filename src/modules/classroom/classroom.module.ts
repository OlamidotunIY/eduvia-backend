import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import {
  AuthGuard,
  IClassroomQueryPort,
  PrismaService,
  RedisService,
} from '@modules/shared';
import {
  CreateClassroomHandler,
  PauseClassroomHandler,
  CloseClassroomHandler,
  UpdateClassroomHandler,
  EnrollStudentHandler,
  RemoveStudentHandler,
  ScheduleLessonHandler,
  StartLessonHandler,
  CompleteLessonHandler,
  CancelLessonHandler,
  MarkStudentNoShowHandler,
  MarkTeacherNoShowHandler,
  AssignCoverTeacherHandler,
  SetTeacherAvailabilityHandler,
  AddAvailabilityExceptionHandler,
  RemoveAvailabilityExceptionHandler,
} from './application/commands';
import {
  GetClassroomByIdHandler,
  ListClassroomsHandler,
  GetLessonByIdHandler,
  ListLessonsHandler,
  GetTeacherAvailabilityHandler,
  GetAvailableSlotsHandler,
} from './application/queries';
import {
  ClassroomMapper,
  StudentEnrollmentMapper,
  LessonMapper,
  TeacherAvailabilityMapper,
} from './infrastructure/persistence/mappers';
import {
  IClassroomRepository,
  ILessonRepository,
  IStudentEnrollmentRepository,
  ITeacherAvailabilityRepository,
} from './domain/repository';
import {
  PrismaClassroomRepository,
  PrismaStudentEnrollmentRepository,
  PrismaLessonRepository,
  PrismaTeacherAvailabilityRepository,
} from './infrastructure/persistence/repository';
import { ClassroomEventProcessor } from './infrastructure/messaging/listeners';
import { ClassroomQueryAdapter } from './infrastructure/services/classroom-query.adapter';
import { LessonArchiveScheduler } from './infrastructure/messaging/scheduler/lesson-archive.scheduler';
import {
  ClassroomController,
  TeacherAvailabilityController,
} from './presentation/controllers';
import {
  ClassroomService,
  TeacherAvailabilityService,
} from './presentation/services';
import {
  ZoomAdapter,
  GoogleMeetAdapter,
  VideoProviderFactory,
} from './infrastructure/video';

const commandHandlers = [
  CreateClassroomHandler,
  PauseClassroomHandler,
  CloseClassroomHandler,
  UpdateClassroomHandler,
  EnrollStudentHandler,
  RemoveStudentHandler,
  ScheduleLessonHandler,
  StartLessonHandler,
  CompleteLessonHandler,
  CancelLessonHandler,
  MarkStudentNoShowHandler,
  MarkTeacherNoShowHandler,
  AssignCoverTeacherHandler,
  SetTeacherAvailabilityHandler,
  AddAvailabilityExceptionHandler,
  RemoveAvailabilityExceptionHandler,
];

const queryHandlers = [
  GetClassroomByIdHandler,
  ListClassroomsHandler,
  GetLessonByIdHandler,
  ListLessonsHandler,
  GetTeacherAvailabilityHandler,
  GetAvailableSlotsHandler,
];

const mappers = [
  ClassroomMapper,
  StudentEnrollmentMapper,
  LessonMapper,
  TeacherAvailabilityMapper,
];

const repositories = [
  { provide: IClassroomRepository, useClass: PrismaClassroomRepository },
  {
    provide: IStudentEnrollmentRepository,
    useClass: PrismaStudentEnrollmentRepository,
  },
  { provide: ILessonRepository, useClass: PrismaLessonRepository },
  {
    provide: ITeacherAvailabilityRepository,
    useClass: PrismaTeacherAvailabilityRepository,
  },
];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({
      name: 'classroom-events',
    }),
  ],
  controllers: [ClassroomController, TeacherAvailabilityController],
  providers: [
    PrismaService,
    RedisService,
    AuthGuard,
    ClassroomService,
    TeacherAvailabilityService,
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,
    ...repositories,
    ClassroomEventProcessor,
    LessonArchiveScheduler,
    ZoomAdapter,
    GoogleMeetAdapter,
    VideoProviderFactory,
    {
      provide: IClassroomQueryPort,
      useClass: ClassroomQueryAdapter,
    },
  ],
  exports: [
    IClassroomRepository,
    ILessonRepository,
    IStudentEnrollmentRepository,
    ITeacherAvailabilityRepository,
    IClassroomQueryPort,
    ClassroomService,
    TeacherAvailabilityService,
    VideoProviderFactory,
  ],
})
export class ClassroomModule {}
