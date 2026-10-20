import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import {
  ILessonReportRepository,
  IStudentProgressSummaryRepository,
  ChurnRiskDomainService,
  StudentChurnRisk,
} from '../../../domain';
import {
  ArchiveLessonReportCommand,
  GenerateOrgAnalyticsSnapshotCommand,
} from '../../../application/commands';

@Injectable()
export class ProgressAnalyticsScheduler {
  private readonly logger = new Logger(ProgressAnalyticsScheduler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly reportRepository: ILessonReportRepository,
    private readonly summaryRepository: IStudentProgressSummaryRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyAnalyticsAndArchive(): Promise<void> {
    this.logger.log('Starting daily progress analytics and archive sweep...');

    try {
      await this.archiveReportsOlderThan7Days();
    } catch (err: any) {
      this.logger.error(`Failed to archive old reports: ${err.message}`, err.stack);
    }

    try {
      await this.generateAnalyticsSnapshots();
    } catch (err: any) {
      this.logger.error(
        `Failed to generate analytics snapshots: ${err.message}`,
        err.stack,
      );
    }

    this.logger.log('Daily progress analytics and archive sweep completed.');
  }

  private async archiveReportsOlderThan7Days(): Promise<void> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const archivableReports = await this.reportRepository.findArchivableReports(
      sevenDaysAgo,
    );

    this.logger.log(`Found ${archivableReports.length} reports to archive.`);
    for (const report of archivableReports) {
      await this.commandBus.execute(
        new ArchiveLessonReportCommand({
          reportId: report.id.unpack(),
          correlationId: 'daily-archive-cron',
        }),
      );
    }
  }

  private async generateAnalyticsSnapshots(): Promise<void> {
    // Collect distinct orgIds from student progress summaries
    const summaries = await this.summaryRepository.findAll();
    const orgIds = Array.from(new Set(summaries.map((s) => s.orgId)));

    for (const orgId of orgIds) {
      const orgSummaries = summaries.filter((s) => s.orgId === orgId);
      const studentChurnRisk: StudentChurnRisk[] = orgSummaries.map((summary) =>
        ChurnRiskDomainService.calculate({
          studentId: summary.studentId,
          studentName: `Student-${summary.studentId.slice(0, 8)}`,
          consecutiveAbsences: summary.totalLessonsMissed,
          recentScores: summary.averageScorePercent ? [summary.averageScorePercent] : [],
          lastLessonAt: summary.lastLessonAt,
          lastParentViewAt: null,
        }),
      );

      await this.commandBus.execute(
        new GenerateOrgAnalyticsSnapshotCommand({
          orgId,
          totalActiveStudents: orgSummaries.length,
          studentChurnRisk,
        }),
      );
    }
  }
}
