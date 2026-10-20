export * from './dto';

export * from './list-platform-admins/list-platform-admins.query';
export * from './list-platform-admins/list-platform-admins.handler';

export * from './get-platform-admin-by-user-id/get-platform-admin-by-user-id.query';
export * from './get-platform-admin-by-user-id/get-platform-admin-by-user-id.handler';

export * from './list-platform-announcements/list-platform-announcements.query';
export * from './list-platform-announcements/list-platform-announcements.handler';

export * from './get-platform-announcement-by-id/get-platform-announcement-by-id.query';
export * from './get-platform-announcement-by-id/get-platform-announcement-by-id.handler';

export * from './list-org-approvals/list-org-approvals.query';
export * from './list-org-approvals/list-org-approvals.handler';

export * from './get-platform-health/get-platform-health.query';
export * from './get-platform-health/get-platform-health.handler';

export * from './get-queue-depths/get-queue-depths.query';
export * from './get-queue-depths/get-queue-depths.handler';

import { ListPlatformAdminsHandler } from './list-platform-admins/list-platform-admins.handler';
import { GetPlatformAdminByUserIdHandler } from './get-platform-admin-by-user-id/get-platform-admin-by-user-id.handler';
import { ListPlatformAnnouncementsHandler } from './list-platform-announcements/list-platform-announcements.handler';
import { GetPlatformAnnouncementByIdHandler } from './get-platform-announcement-by-id/get-platform-announcement-by-id.handler';
import { ListOrgApprovalsHandler } from './list-org-approvals/list-org-approvals.handler';
import { GetPlatformHealthHandler } from './get-platform-health/get-platform-health.handler';
import { GetQueueDepthsHandler } from './get-queue-depths/get-queue-depths.handler';

export const QUERY_HANDLERS = [
  ListPlatformAdminsHandler,
  GetPlatformAdminByUserIdHandler,
  ListPlatformAnnouncementsHandler,
  GetPlatformAnnouncementByIdHandler,
  ListOrgApprovalsHandler,
  GetPlatformHealthHandler,
  GetQueueDepthsHandler,
];
