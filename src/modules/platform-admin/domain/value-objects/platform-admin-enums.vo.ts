export enum PlatformAdminRole {
  PlatformSuperAdmin = 'PlatformSuperAdmin',
  CurriculumEditor = 'CurriculumEditor',
  PlatformSupport = 'PlatformSupport',
}

export enum AnnouncementStatus {
  draft = 'draft',
  scheduled = 'scheduled',
  published = 'published',
  archived = 'archived',
}

export enum ApprovalDecision {
  approved = 'approved',
  rejected = 'rejected',
  suspended = 'suspended',
  reactivated = 'reactivated',
}

export enum PlatformHealthStatus {
  green = 'green',
  yellow = 'yellow',
  red = 'red',
}
