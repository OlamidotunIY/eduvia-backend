export * from './create-platform-admin/create-platform-admin.command';
export * from './create-platform-admin/create-platform-admin.handler';

export * from './approve-org/approve-org.command';
export * from './approve-org/approve-org.handler';

export * from './reject-org/reject-org.command';
export * from './reject-org/reject-org.handler';

export * from './suspend-org/suspend-org.command';
export * from './suspend-org/suspend-org.handler';

export * from './reactivate-org/reactivate-org.command';
export * from './reactivate-org/reactivate-org.handler';

export * from './create-platform-announcement/create-platform-announcement.command';
export * from './create-platform-announcement/create-platform-announcement.handler';

export * from './publish-platform-announcement/publish-platform-announcement.command';
export * from './publish-platform-announcement/publish-platform-announcement.handler';

export * from './schedule-platform-announcement/schedule-platform-announcement.command';
export * from './schedule-platform-announcement/schedule-platform-announcement.handler';

export * from './archive-platform-announcement/archive-platform-announcement.command';
export * from './archive-platform-announcement/archive-platform-announcement.handler';

import { CreatePlatformAdminHandler } from './create-platform-admin/create-platform-admin.handler';
import { ApproveOrgHandler } from './approve-org/approve-org.handler';
import { RejectOrgHandler } from './reject-org/reject-org.handler';
import { SuspendOrgHandler } from './suspend-org/suspend-org.handler';
import { ReactivateOrgHandler } from './reactivate-org/reactivate-org.handler';
import { CreatePlatformAnnouncementHandler } from './create-platform-announcement/create-platform-announcement.handler';
import { PublishPlatformAnnouncementHandler } from './publish-platform-announcement/publish-platform-announcement.handler';
import { SchedulePlatformAnnouncementHandler } from './schedule-platform-announcement/schedule-platform-announcement.handler';
import { ArchivePlatformAnnouncementHandler } from './archive-platform-announcement/archive-platform-announcement.handler';

export const COMMAND_HANDLERS = [
  CreatePlatformAdminHandler,
  ApproveOrgHandler,
  RejectOrgHandler,
  SuspendOrgHandler,
  ReactivateOrgHandler,
  CreatePlatformAnnouncementHandler,
  PublishPlatformAnnouncementHandler,
  SchedulePlatformAnnouncementHandler,
  ArchivePlatformAnnouncementHandler,
];
