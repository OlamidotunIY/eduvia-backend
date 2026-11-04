import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import {
  AuthGuard,
  IBoardQueryPort,
  FirebaseStorageService,
} from '@modules/shared';
import {
  CreateBoardHandler,
  SwitchBoardModeHandler,
  LockBoardHandler,
  UnlockBoardHandler,
  SaveLessonPlanHandler,
  CompleteLessonPlanHandler,
  AddBoardSectionHandler,
  UpdateBoardSectionHandler,
  RemoveBoardSectionHandler,
  ImportBoardContentHandler,
  AttachBoardQuestionHandler,
  RemoveBoardQuestionHandler,
  SubmitStudentResponseHandler,
  MarkStudentResponseHandler,
} from './application/commands';
import {
  GetBoardByIdHandler,
  GetBoardByLessonIdHandler,
  ListBoardQuestionsHandler,
  ListStudentResponsesHandler,
  GetStudentResponseHandler,
} from './application/queries';
import {
  LearningBoardMapper,
  BoardSectionMapper,
  BoardQuestionMapper,
  StudentResponseMapper,
} from './infrastructure/persistence/mappers';
import {
  ILearningBoardRepository,
  IBoardSectionRepository,
  IBoardQuestionRepository,
  IStudentResponseRepository,
} from './domain/repository';
import {
  PrismaLearningBoardRepository,
  PrismaBoardSectionRepository,
  PrismaBoardQuestionRepository,
  PrismaStudentResponseRepository,
} from './infrastructure/persistence/repository';
import { BoardEventProcessor } from './infrastructure/messaging/listeners';
import {
  BoardQueryAdapter,
  BoardOtService,
  BoardStorageService,
} from './infrastructure/services';
import {
  ShareDBBackendService,
  BoardDocumentService,
} from './infrastructure/sharedb';
import { BoardController } from './presentation/controllers';
import { BoardService } from './presentation/services';

const commandHandlers = [
  CreateBoardHandler,
  SwitchBoardModeHandler,
  LockBoardHandler,
  UnlockBoardHandler,
  SaveLessonPlanHandler,
  CompleteLessonPlanHandler,
  AddBoardSectionHandler,
  UpdateBoardSectionHandler,
  RemoveBoardSectionHandler,
  ImportBoardContentHandler,
  AttachBoardQuestionHandler,
  RemoveBoardQuestionHandler,
  SubmitStudentResponseHandler,
  MarkStudentResponseHandler,
];

const queryHandlers = [
  GetBoardByIdHandler,
  GetBoardByLessonIdHandler,
  ListBoardQuestionsHandler,
  ListStudentResponsesHandler,
  GetStudentResponseHandler,
];

const mappers = [
  LearningBoardMapper,
  BoardSectionMapper,
  BoardQuestionMapper,
  StudentResponseMapper,
];

const repositories = [
  PrismaLearningBoardRepository,
  PrismaBoardSectionRepository,
  PrismaBoardQuestionRepository,
  PrismaStudentResponseRepository,
  {
    provide: ILearningBoardRepository,
    useClass: PrismaLearningBoardRepository,
  },
  {
    provide: IBoardSectionRepository,
    useClass: PrismaBoardSectionRepository,
  },
  {
    provide: IBoardQuestionRepository,
    useClass: PrismaBoardQuestionRepository,
  },
  {
    provide: IStudentResponseRepository,
    useClass: PrismaStudentResponseRepository,
  },
];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue(
      { name: 'board-events' },
      { name: 'classroom-events' },
    ),
  ],
  controllers: [BoardController],
  providers: [
    AuthGuard,
    FirebaseStorageService,
    BoardService,
    BoardOtService,
    BoardStorageService,
    ShareDBBackendService,
    BoardDocumentService,
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,
    ...repositories,
    BoardEventProcessor,
    {
      provide: IBoardQueryPort,
      useClass: BoardQueryAdapter,
    },
  ],
  exports: [
    ILearningBoardRepository,
    IBoardSectionRepository,
    IBoardQuestionRepository,
    IStudentResponseRepository,
    IBoardQueryPort,
    BoardService,
    BoardOtService,
    BoardStorageService,
    ShareDBBackendService,
    BoardDocumentService,
  ],
})
export class BoardModule {}
