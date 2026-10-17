export interface PlatformHealthMetricDto {
  snapshotAt: Date;
  totalOrgs: number;
  totalActiveOrgs: number;
  totalPendingApproval: number;
  totalUsers: number;
  totalActiveStudents: number;
  totalLessonsToday: number;
  totalLessonsThisMonth: number;
  totalRevenue: { amount: number; currency: string };
  aiCostThisMonth: { amount: number; currency: string };
  outboxQueueDepth: number;
  bullmqQueueDepths: { queue: string; waiting: number; active: number; failed: number }[];
  elasticsearchIndexHealth: string;
}

export abstract class IPlatformMonitoringPort {
  public abstract getHealthMetrics(): Promise<PlatformHealthMetricDto>;
  public abstract getQueueDepths(): Promise<{ queue: string; waiting: number; active: number; failed: number }[]>;
}
