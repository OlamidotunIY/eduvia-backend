import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreatePlatformAdminCommand,
  ApproveOrgCommand,
  RejectOrgCommand,
  SuspendOrgCommand,
  ReactivateOrgCommand,
  CreatePlatformAnnouncementCommand,
  PublishPlatformAnnouncementCommand,
  SchedulePlatformAnnouncementCommand,
  ArchivePlatformAnnouncementCommand,
} from '../../application/commands';
import {
  ListPlatformAdminsQuery,
  GetPlatformAdminByUserIdQuery,
  ListPlatformAnnouncementsQuery,
  GetPlatformAnnouncementByIdQuery,
  ListOrgApprovalsQuery,
  GetPlatformHealthQuery,
  GetQueueDepthsQuery,
  PlatformAdminDto,
  PlatformAnnouncementDto,
  OrgApprovalRecordDto,
} from '../../application/queries';
import {
  CreatePlatformAdminDto,
  ApproveOrgDto,
  RejectOrgDto,
  SuspendOrgDto,
  CreateAnnouncementDto,
  ScheduleAnnouncementDto,
} from '../dto';
import { AnnouncementStatus, PlatformHealthMetricDto } from '../../domain';

@Injectable()
export class PlatformAdminService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  public async createPlatformAdmin(
    callerUserId: string,
    dto: CreatePlatformAdminDto,
  ) {
    return this.commandBus.execute(
      new CreatePlatformAdminCommand(callerUserId, dto.userId, dto.role),
    );
  }

  public async listPlatformAdmins(): Promise<PlatformAdminDto[]> {
    return this.queryBus.execute(new ListPlatformAdminsQuery());
  }

  public async getPlatformAdminByUserId(
    userId: string,
  ): Promise<PlatformAdminDto | null> {
    return this.queryBus.execute(new GetPlatformAdminByUserIdQuery(userId));
  }

  public async approveOrg(
    reviewerUserId: string,
    orgId: string,
    dto: ApproveOrgDto,
  ) {
    return this.commandBus.execute(
      new ApproveOrgCommand(reviewerUserId, orgId, dto.reason),
    );
  }

  public async rejectOrg(
    reviewerUserId: string,
    orgId: string,
    dto: RejectOrgDto,
  ) {
    return this.commandBus.execute(
      new RejectOrgCommand(reviewerUserId, orgId, dto.reason),
    );
  }

  public async suspendOrg(
    adminUserId: string,
    orgId: string,
    dto: SuspendOrgDto,
  ) {
    return this.commandBus.execute(
      new SuspendOrgCommand(adminUserId, orgId, dto.reason),
    );
  }

  public async reactivateOrg(adminUserId: string, orgId: string) {
    return this.commandBus.execute(
      new ReactivateOrgCommand(adminUserId, orgId),
    );
  }

  public async listOrgApprovals(
    orgId?: string,
  ): Promise<OrgApprovalRecordDto[]> {
    return this.queryBus.execute(new ListOrgApprovalsQuery(orgId));
  }

  public async getPlatformHealth(): Promise<PlatformHealthMetricDto> {
    return this.queryBus.execute(new GetPlatformHealthQuery());
  }

  public async getQueueDepths() {
    return this.queryBus.execute(new GetQueueDepthsQuery());
  }

  public async createAnnouncement(
    creatorUserId: string,
    dto: CreateAnnouncementDto,
  ) {
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;
    return this.commandBus.execute(
      new CreatePlatformAnnouncementCommand(
        creatorUserId,
        dto.title,
        dto.body,
        dto.targetRoles,
        scheduledAt,
      ),
    );
  }

  public async listAnnouncements(
    status?: AnnouncementStatus,
  ): Promise<PlatformAnnouncementDto[]> {
    return this.queryBus.execute(new ListPlatformAnnouncementsQuery(status));
  }

  public async getAnnouncementById(
    id: string,
  ): Promise<PlatformAnnouncementDto | null> {
    return this.queryBus.execute(new GetPlatformAnnouncementByIdQuery(id));
  }

  public async publishAnnouncement(adminUserId: string, id: string) {
    return this.commandBus.execute(
      new PublishPlatformAnnouncementCommand(adminUserId, id),
    );
  }

  public async scheduleAnnouncement(
    adminUserId: string,
    id: string,
    dto: ScheduleAnnouncementDto,
  ) {
    return this.commandBus.execute(
      new SchedulePlatformAnnouncementCommand(
        adminUserId,
        id,
        new Date(dto.scheduledAt),
      ),
    );
  }

  public async archiveAnnouncement(adminUserId: string, id: string) {
    return this.commandBus.execute(
      new ArchivePlatformAnnouncementCommand(adminUserId, id),
    );
  }
}
