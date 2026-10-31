import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import {
  AuthGuard,
  ICurriculumQueryPort,
} from '@modules/shared';
import { CURRICULUM_COMMAND_HANDLERS } from './application/commands';
import { CURRICULUM_QUERY_HANDLERS } from './application/queries';
import {
  CurriculumProfileMapper,
  CurriculumNodeMapper,
  PlatformSubjectMapper,
  SubjectCurriculumMappingMapper,
} from './infrastructure/persistence/mappers';
import {
  ICurriculumProfileRepository,
  ICurriculumNodeRepository,
  IPlatformSubjectRepository,
  ISubjectCurriculumMappingRepository,
} from './domain/repository';
import {
  PrismaCurriculumProfileRepository,
  PrismaCurriculumNodeRepository,
  PrismaPlatformSubjectRepository,
  PrismaSubjectCurriculumMappingRepository,
} from './infrastructure/persistence/repository';
import { CurriculumCascadeDeactivateProcessor } from './infrastructure/messaging/listeners';
import { CurriculumQueryAdapter } from './infrastructure/services/curriculum-query.adapter';
import {
  CurriculumController,
  CurriculumNodeController,
  PlatformSubjectController,
  StudentCurriculumController,
} from './presentation/controllers';
import { CurriculumService } from './presentation/services';

const mappers = [
  CurriculumProfileMapper,
  CurriculumNodeMapper,
  PlatformSubjectMapper,
  SubjectCurriculumMappingMapper,
];

const repositories = [
  PrismaCurriculumProfileRepository,
  PrismaCurriculumNodeRepository,
  PrismaPlatformSubjectRepository,
  PrismaSubjectCurriculumMappingRepository,
  {
    provide: ICurriculumProfileRepository,
    useClass: PrismaCurriculumProfileRepository,
  },
  {
    provide: ICurriculumNodeRepository,
    useClass: PrismaCurriculumNodeRepository,
  },
  {
    provide: IPlatformSubjectRepository,
    useClass: PrismaPlatformSubjectRepository,
  },
  {
    provide: ISubjectCurriculumMappingRepository,
    useClass: PrismaSubjectCurriculumMappingRepository,
  },
];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: 'search-events' }),
  ],
  controllers: [
    CurriculumController,
    CurriculumNodeController,
    PlatformSubjectController,
    StudentCurriculumController,
  ],
  providers: [
    AuthGuard,
    CurriculumService,
    ...CURRICULUM_COMMAND_HANDLERS,
    ...CURRICULUM_QUERY_HANDLERS,
    ...mappers,
    ...repositories,
    CurriculumCascadeDeactivateProcessor,
    {
      provide: ICurriculumQueryPort,
      useClass: CurriculumQueryAdapter,
    },
  ],
  exports: [
    ICurriculumProfileRepository,
    ICurriculumNodeRepository,
    IPlatformSubjectRepository,
    ISubjectCurriculumMappingRepository,
    ICurriculumQueryPort,
    CurriculumService,
  ],
})
export class CurriculumModule {}
