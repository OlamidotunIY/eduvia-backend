import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import {
  AuthGuard,
  IOrganizationQueryPort,
} from '@modules/shared';
import {
  AcceptOrganizationInvitationByTokenHandler,
  AcceptOrganizationInvitationHandler,
  ApproveTeacherApplicationHandler,
  ChangeMemberRoleHandler,
  CreateOrganizationHandler,
  CreateOrganizationMembershipHandler,
  CreateOrganizationSubjectHandler,
  DelistOrganizationFromMarketplaceHandler,
  ListOrganizationOnMarketplaceHandler,
  ReceiveTeacherApplicationHandler,
  RejectTeacherApplicationHandler,
  SendOrganizationInvitationHandler,
  SuspendMemberHandler,
  SelectActiveOrganizationHandler,
  UpdateOrganizationPolicyHandler,
  UpdateOrganizationProfileHandler,
  UpdateOrganizationSubjectHandler,
} from './application/commands';
import {
  GetOrganizationBySlugHandler,
  GetOrganizationMembersHandler,
  GetOrganizationSubjectsHandler,
  GetTeacherApplicationsHandler,
  ListMarketplaceOrganizationsHandler,
} from './application/queries';
import { OrganizationInvitationMapper } from './infrastructure/mappers/organization-invitation.mapper';
import { OrganizationMembershipMapper } from './infrastructure/mappers/organization-membership.mapper';
import { OrganizationSubjectMapper } from './infrastructure/mappers/organization-subject.mapper';
import { OrganizationMapper } from './infrastructure/mappers/organization.mapper';
import { TeacherApplicationMapper } from './infrastructure/mappers/teacher-application.mapper';
import { OrganizationEventProcessor } from './infrastructure/messaging/listeners/org-event.processor';
import { OrganizationController } from './presentation/controllers/organization.controller';
import { MarketplaceController } from './presentation/controllers/marketplace.controller';
import { OrganizationService } from './presentation/services';
import {
  IOrganizationInvitationRepository,
  IOrganizationMembershipRepository,
  IOrganizationRepository,
  IOrganizationSubjectRepository,
  ITeacherApplicationRepository,
} from './domain/repository';
import { PrismaOrganizationInvitationRepository } from './infrastructure/repositories/org-invitation-repository.adapter';
import { PrismaOrganizationMembershipRepository } from './infrastructure/repositories/org-membership-repository.adapter';
import { PrismaOrganizationSubjectRepository } from './infrastructure/repositories/org-subject-repository.adapter';
import { PrismaOrganizationRepository } from './infrastructure/repositories/organization-repository.adapter';
import { PrismaTeacherApplicationRepository } from './infrastructure/repositories/teacher-application-repository.adapter';
import { OrganizationQueryAdapter } from './infrastructure/services/organization-query.adapter';
import { UserModule } from '../user/user.module';

const commandHandlers = [
  CreateOrganizationHandler,
  CreateOrganizationMembershipHandler,
  AcceptOrganizationInvitationHandler,
  ReceiveTeacherApplicationHandler,
  UpdateOrganizationSubjectHandler,
  UpdateOrganizationProfileHandler,
  ListOrganizationOnMarketplaceHandler,
  DelistOrganizationFromMarketplaceHandler,
  UpdateOrganizationPolicyHandler,
  CreateOrganizationSubjectHandler,
  ApproveTeacherApplicationHandler,
  RejectTeacherApplicationHandler,
  SendOrganizationInvitationHandler,
  AcceptOrganizationInvitationByTokenHandler,
  ChangeMemberRoleHandler,
  SuspendMemberHandler,
  SelectActiveOrganizationHandler,
];

const queryHandlers = [
  GetOrganizationBySlugHandler,
  GetOrganizationSubjectsHandler,
  GetTeacherApplicationsHandler,
  GetOrganizationMembersHandler,
  ListMarketplaceOrganizationsHandler,
];

const EventProcessors = [OrganizationEventProcessor];

const Mappers = [
  OrganizationInvitationMapper,
  OrganizationMembershipMapper,
  OrganizationSubjectMapper,
  OrganizationMapper,
  TeacherApplicationMapper,
];

const portBinding = [
  {
    provide: IOrganizationInvitationRepository,
    useClass: PrismaOrganizationInvitationRepository,
  },
  {
    provide: IOrganizationMembershipRepository,
    useClass: PrismaOrganizationMembershipRepository,
  },
  {
    provide: IOrganizationSubjectRepository,
    useClass: PrismaOrganizationSubjectRepository,
  },
  {
    provide: IOrganizationRepository,
    useClass: PrismaOrganizationRepository,
  },
  {
    provide: ITeacherApplicationRepository,
    useClass: PrismaTeacherApplicationRepository,
  },
  {
    provide: IOrganizationQueryPort,
    useClass: OrganizationQueryAdapter,
  },
];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: 'org-events' }),
    UserModule,
  ],
  controllers: [OrganizationController, MarketplaceController],
  providers: [
    AuthGuard,
    OrganizationService,
    ...Mappers,
    ...portBinding,
    ...commandHandlers,
    ...queryHandlers,
    ...EventProcessors,
  ],
  exports: [IOrganizationQueryPort],
})
export class OrgModule {}
