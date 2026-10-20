import { Injectable } from '@nestjs/common';
import {
  IPlatformAdminQueryPort,
  SharedPlatformAdminDto,
  SharedPlatformAnnouncementDto,
  SharedOrgApprovalRecordDto,
} from '@modules/shared';
import {
  IPlatformAdminRepository,
  IPlatformAnnouncementRepository,
  IOrgApprovalRecordRepository,
  AnnouncementStatus,
} from '../../domain';

@Injectable()
export class PlatformAdminQueryAdapter implements IPlatformAdminQueryPort {
  constructor(
    private readonly adminRepository: IPlatformAdminRepository,
    private readonly announcementRepository: IPlatformAnnouncementRepository,
    private readonly approvalRepository: IOrgApprovalRecordRepository,
  ) {}

  public async isPlatformSuperAdmin(userId: string): Promise<boolean> {
    const admin = await this.adminRepository.findByUserId(userId);
    return Boolean(admin?.isSuperAdmin());
  }

  public async isPlatformAdmin(userId: string): Promise<boolean> {
    const admin = await this.adminRepository.findByUserId(userId);
    return Boolean(admin);
  }

  public async getPlatformAdminByUserId(
    userId: string,
  ): Promise<SharedPlatformAdminDto | null> {
    const admin = await this.adminRepository.findByUserId(userId);
    if (!admin) {
      return null;
    }
    return {
      id: admin.id.toString(),
      userId: admin.userId,
      role: admin.role,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  public async getActiveAnnouncements(
    targetRole?: string,
  ): Promise<SharedPlatformAnnouncementDto[]> {
    const announcements = await this.announcementRepository.findByStatus(
      AnnouncementStatus.published,
    );

    const filtered = targetRole
      ? announcements.filter(
          (a) =>
            a.targetRoles.length === 0 || a.targetRoles.includes(targetRole),
        )
      : announcements;

    return filtered.map((a) => ({
      id: a.id.toString(),
      title: a.title,
      body: a.body,
      targetRoles: a.targetRoles,
      status: a.status,
      publishedAt: a.publishedAt,
    }));
  }

  public async getLatestOrgApproval(
    orgId: string,
  ): Promise<SharedOrgApprovalRecordDto | null> {
    const record = await this.approvalRepository.findLatestByOrgId(orgId);
    if (!record) {
      return null;
    }
    return {
      id: record.id.toString(),
      orgId: record.orgId,
      reviewedBy: record.reviewedBy,
      decision: record.decision,
      reason: record.reason,
      reviewedAt: record.reviewedAt,
    };
  }
}
