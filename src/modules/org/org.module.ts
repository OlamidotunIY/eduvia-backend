import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import {
  AuthGuard,
  ICurriculumQueryPort,
  IOrganizationAuthorizationQueryPort,
  IOrganizationQueryPort,
  OrganizationPermissionGuard,
} from '@modules/shared';
import {
  AcceptOrganizationInvitationByTokenHandler,
  AssignOrganizationRoleHandler,
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
  ProvisionDefaultOrganizationRolesHandler,
  CreateOrganizationRoleHandler,
  UpdateOrganizationRoleHandler,
  UpdateOrganizationPolicyHandler,
  UpdateOrganizationProfileHandler,
  UpdateOrganizationSubjectHandler,
} from './application/commands';
import {
  GetOrganizationBySlugHandler,
  GetOrganizationMembersHandler,
  GetOrganizationRolesHandler,
  GetOrganizationSubjectsHandler,
  GetTeacherApplicationsHandler,
  ListMarketplaceOrganizationsHandler,
} from './application/queries';
import { OrganizationInvitationMapper } from './infrastructure/mappers/organization-invitation.mapper';
import { OrganizationMembershipMapper } from './infrastructure/mappers/organization-membership.mapper';
import { OrganizationRoleMapper } from './infrastructure/mappers/organization-role.mapper';
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
  IOrganizationRoleRepository,
} from './domain/repository';
import { PrismaOrganizationInvitationRepository } from './infrastructure/repositories/org-invitation-repository.adapter';
import { PrismaOrganizationMembershipRepository } from './infrastructure/repositories/org-membership-repository.adapter';
import { PrismaOrganizationSubjectRepository } from './infrastructure/repositories/org-subject-repository.adapter';
import { PrismaOrganizationRepository } from './infrastructure/repositories/organization-repository.adapter';
import { PrismaTeacherApplicationRepository } from './infrastructure/repositories/teacher-application-repository.adapter';
import { PrismaOrganizationRoleRepository } from './infrastructure/repositories/organization-role-repository.adapter';
import { OrganizationQueryAdapter } from './infrastructure/services/organization-query.adapter';
import { OrganizationAuthorizationQueryAdapter } from './infrastructure/services/organization-authorization-query.adapter';
import { UserModule } from '../user/user.module';
import { CurriculumModule } from '../curriculum/curriculum.module';

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
  AssignOrganizationRoleHandler,
  ChangeMemberRoleHandler,
  SuspendMemberHandler,
  SelectActiveOrganizationHandler,
  ProvisionDefaultOrganizationRolesHandler,
  CreateOrganizationRoleHandler,
  UpdateOrganizationRoleHandler,
];

const queryHandlers = [
  GetOrganizationBySlugHandler,
  GetOrganizationSubjectsHandler,
  GetTeacherApplicationsHandler,
  GetOrganizationMembersHandler,
  GetOrganizationRolesHandler,
  ListMarketplaceOrganizationsHandler,
];

const EventProcessors = [OrganizationEventProcessor];

const Mappers = [
  OrganizationInvitationMapper,
  OrganizationMembershipMapper,
  OrganizationRoleMapper,
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
    provide: IOrganizationRoleRepository,
    useClass: PrismaOrganizationRoleRepository,
  },
  {
    provide: IOrganizationQueryPort,
    useClass: OrganizationQueryAdapter,
  },
  {
    provide: IOrganizationAuthorizationQueryPort,
    useClass: OrganizationAuthorizationQueryAdapter,
  },
];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: 'org-events' }),
    UserModule,
    CurriculumModule,
  ],
  controllers: [OrganizationController, MarketplaceController],
  providers: [
    AuthGuard,
    OrganizationPermissionGuard,
    OrganizationService,
    ...Mappers,
    ...portBinding,
    ...commandHandlers,
    ...queryHandlers,
    ...EventProcessors,
  ],
  exports: [IOrganizationQueryPort, IOrganizationAuthorizationQueryPort],
})
export class OrgModule {}
