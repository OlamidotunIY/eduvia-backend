import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import {
  AuthGuard,
  ICurriculumQueryPort,
  OrganizationPermissionGuard,
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
import { CurriculumTreeSeederService } from './infrastructure/seeding/curriculum-tree-seeder.service';
import {
  CurriculumController,
  CurriculumNodeController,
  OrganizationCurriculumController,
  PlatformSubjectController,
  StudentCurriculumController,
} from './presentation/controllers';
import { CurriculumService } from './presentation/services';
import { OrgModule } from '../org/org.module';
import { ClassroomModule } from '../classroom/classroom.module';
import { UserModule } from '../user/user.module';

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

@Global()
@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: 'search-events' }),
    OrgModule,
    ClassroomModule,
    UserModule,
  ],
  controllers: [
    CurriculumController,
    CurriculumNodeController,
    OrganizationCurriculumController,
    PlatformSubjectController,
    StudentCurriculumController,
  ],
  providers: [
    AuthGuard,
    OrganizationPermissionGuard,
    CurriculumService,
    ...CURRICULUM_COMMAND_HANDLERS,
    ...CURRICULUM_QUERY_HANDLERS,
    ...mappers,
    ...repositories,
    CurriculumCascadeDeactivateProcessor,
    CurriculumTreeSeederService,
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
    CurriculumTreeSeederService,
  ],
})
export class CurriculumModule {}
