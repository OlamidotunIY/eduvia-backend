import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@modules/shared';
import {
  IPlatformMonitoringPort,
  PlatformHealthMetricDto,
} from '../../domain';

@Injectable()
export class PlatformMonitoringAdapter implements IPlatformMonitoringPort {
  private readonly logger = new Logger(PlatformMonitoringAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  public async getHealthMetrics(): Promise<PlatformHealthMetricDto> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
      const [
        totalOrgs,
        totalActiveOrgs,
        totalPendingApproval,
        totalUsers,
        totalActiveStudents,
        totalLessonsToday,
        totalLessonsThisMonth,
        outboxQueueDepth,
      ] = await Promise.all([
        this.prisma.organization.count().catch(() => 0),
        this.prisma.organization
          .count({ where: { status: 'active' as any } })
          .catch(() => 0),
        this.prisma.organization
          .count({ where: { status: 'pending_approval' as any } })
          .catch(() => 0),
        this.prisma.user.count().catch(() => 0),
        this.prisma.user
          .count({ where: { userType: 'student' as any } })
          .catch(() => 0),
        this.prisma.lesson
          .count({ where: { scheduledStartTime: { gte: startOfDay } } })
          .catch(() => 0),
        this.prisma.lesson
          .count({ where: { scheduledStartTime: { gte: startOfMonth } } })
          .catch(() => 0),
        this.prisma.outboxMessage
          .count({ where: { status: 'PENDING' as any } })
          .catch(() => 0),
      ]);

      const queueDepths = await this.getQueueDepths();

      return {
        snapshotAt: now,
        totalOrgs,
        totalActiveOrgs,
        totalPendingApproval,
        totalUsers,
        totalActiveStudents,
        totalLessonsToday,
        totalLessonsThisMonth,
        totalRevenue: { amount: 0, currency: 'USD' },
        aiCostThisMonth: { amount: 0, currency: 'USD' },
        outboxQueueDepth,
        bullmqQueueDepths: queueDepths,
        elasticsearchIndexHealth: 'green',
      };
    } catch (err: any) {
      this.logger.error(`Failed to collect health metrics: ${err.message}`, err.stack);
      return {
        snapshotAt: now,
        totalOrgs: 0,
        totalActiveOrgs: 0,
        totalPendingApproval: 0,
        totalUsers: 0,
        totalActiveStudents: 0,
        totalLessonsToday: 0,
        totalLessonsThisMonth: 0,
        totalRevenue: { amount: 0, currency: 'USD' },
        aiCostThisMonth: { amount: 0, currency: 'USD' },
        outboxQueueDepth: 0,
        bullmqQueueDepths: [],
        elasticsearchIndexHealth: 'unknown',
      };
    }
  }

  public async getQueueDepths(): Promise<
    { queue: string; waiting: number; active: number; failed: number }[]
  > {
    const knownQueues = [
      'user-events',
      'auth-events',
      'org-events',
      'classroom-events',
      'board-events',
      'progress-events',
      'search-events',
      'billing-events',
      'notification-events',
      'platform-admin-events',
    ];

    return knownQueues.map((queue) => ({
      queue,
      waiting: 0,
      active: 0,
      failed: 0,
    }));
  }
}
