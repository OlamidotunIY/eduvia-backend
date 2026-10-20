export interface SharedPlatformAdminDto {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharedPlatformAnnouncementDto {
  id: string;
  title: string;
  body: string;
  targetRoles: string[];
  status: string;
  publishedAt: Date | null;
}

export interface SharedOrgApprovalRecordDto {
  id: string;
  orgId: string;
  reviewedBy: string;
  decision: string;
  reason: string | null;
  reviewedAt: Date;
}

export abstract class IPlatformAdminQueryPort {
  public abstract isPlatformSuperAdmin(userId: string): Promise<boolean>;

  public abstract isPlatformAdmin(userId: string): Promise<boolean>;

  public abstract getPlatformAdminByUserId(
    userId: string,
  ): Promise<SharedPlatformAdminDto | null>;

  public abstract getActiveAnnouncements(
    targetRole?: string,
  ): Promise<SharedPlatformAnnouncementDto[]>;

  public abstract getLatestOrgApproval(
    orgId: string,
  ): Promise<SharedOrgApprovalRecordDto | null>;
}
