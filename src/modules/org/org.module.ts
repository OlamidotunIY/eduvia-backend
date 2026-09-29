import { Module } from "@nestjs/common";
import { CreateOrganizationHandler } from "./application/commands/create-organization";
import { AcceptOrganizationInvitationHandler } from "./application/commands/org-invitation-accepted/org-invitation-accepted.handler";
import { ReceiveTeacherApplicationHandler } from "./application/commands/receive-teacher-application";
import { UpdateOrganizationSubjectHandler } from "./application/commands/update-organization-subject/update-organization-subject.handler";
import { OrganizationInvitationMapper } from "./infrastructure/mappers/organization-invitation.mapper";
import { OrganizationMembershipMapper } from "./infrastructure/mappers/organization-membership.mapper";
import { OrganizationSubjectMapper } from "./infrastructure/mappers/organization-subject.mapper";
import { OrganizationMapper } from "./infrastructure/mappers/organization.mapper";
import { TeacherApplicationMapper } from "./infrastructure/mappers/teacher-application.mapper";
import { OrganizationEventProcessor } from "./infrastructure/messaging/listeners/org-event.processor";
import { CqrsModule } from "@nestjs/cqrs";
import { BullModule } from "@nestjs/bullmq";
import { OrganizationController } from "./presentation/controllers/organization.controller";
import { AuthGuard, PrismaService, RedisService } from "@modules/shared";
import { OrganizationService } from "./presentation/services";
import { IOrganizationInvitationRepository, IOrganizationMembershipRepository, IOrganizationRepository, IOrganizationSubjectRepository, ITeacherApplicationRepository } from "./domain/repository";
import { PrismaOrganizationInvitationRepository } from "./infrastructure/repositories/org-invitation-repository.adapter";
import { PrismaOrganizationMembershipRepository } from "./infrastructure/repositories/org-membership-repository.adapter";
import { PrismaOrganizationSubjectRepository } from "./infrastructure/repositories/org-subject-repository.adapter";
import { PrismaOrganizationRepository } from "./infrastructure/repositories/organization-repository.adapter";
import { PrismaTeacherApplicationRepository } from "./infrastructure/repositories/teacher-application-repository.adapter";

const commandHandlers = [
    CreateOrganizationHandler,
    AcceptOrganizationInvitationHandler,
    ReceiveTeacherApplicationHandler,
    UpdateOrganizationSubjectHandler
];

const EventProcessors = [
    OrganizationEventProcessor
];

const Mappers =[
    OrganizationInvitationMapper,
    OrganizationMembershipMapper,
    OrganizationSubjectMapper,
    OrganizationMapper,
    TeacherApplicationMapper
];

const portBinding = [
    { provide: IOrganizationInvitationRepository, useClass: PrismaOrganizationInvitationRepository },
    { provide: IOrganizationMembershipRepository, useClass: PrismaOrganizationMembershipRepository},
    { provide: IOrganizationSubjectRepository, useClass: PrismaOrganizationSubjectRepository },
    { provide: IOrganizationRepository, useClass: PrismaOrganizationRepository },
    { provide: ITeacherApplicationRepository, useClass: PrismaTeacherApplicationRepository }
]

@Module({
    imports: [CqrsModule, BullModule.registerQueue({ name: 'org-event' })],
    controllers: [OrganizationController],
    providers:[
        PrismaService,
        RedisService,
        AuthGuard,
        OrganizationService,
        ...Mappers,
        ...portBinding,
        ...commandHandlers,
        ...EventProcessors
    ]
})

export class OrgModule {}