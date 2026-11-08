import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrgAnalyticsQuery } from './get-org-analytics.query';
import { OrgAnalyticsDto } from './org-analytics.dto';
import {
  IOrgAnalyticsSnapshotRepository,
  OrgAnalyticsSnapshot,
  TeacherPerformanceStat,
  StudentChurnRisk,
  EnrollmentFunnelStat,
} from '../../../domain';
import { PrismaService } from '@modules/shared';

@QueryHandler(GetOrgAnalyticsQuery)
export class GetOrgAnalyticsHandler
  implements IQueryHandler<GetOrgAnalyticsQuery, OrgAnalyticsDto>
{
  constructor(
    private readonly snapshotRepository: IOrgAnalyticsSnapshotRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(query: GetOrgAnalyticsQuery): Promise<OrgAnalyticsDto> {
    let snapshot = query.date
      ? await this.snapshotRepository.findByOrgAndDate(query.orgId, query.date)
      : await this.snapshotRepository.findLatestByOrg(query.orgId);

    // Detect legacy mock snapshots (which had hardcoded sample names or placeholder numbers)
    const isMock =
      snapshot &&
      (snapshot.studentChurnRisk.some((s) => s.studentName === 'Tariq Musa') ||
        snapshot.teacherPerformance.some(
          (t) =>
            t.teacherId === 'teacher-1' || t.teacherName === 'Adenike Okafor',
        ) ||
        (snapshot.totalActiveStudents === 248 &&
          snapshot.totalLessonsThisMonth === 436));

    if (!snapshot || isMock) {
      snapshot = await this.generateSnapshotForOrg(query.orgId, query.date);
    }

    const history = await this.snapshotRepository.findHistoryByOrg(query.orgId, 10);
    const historyDates = history.map((h) => h.snapshotDate.toISOString().split('T')[0]);
    const currentDate = snapshot.snapshotDate.toISOString().split('T')[0];
    const availableSnapshotDates = Array.from(
      new Set([currentDate, ...historyDates]),
    ).filter(Boolean);

    return {
      id: snapshot.id.unpack(),
      orgId: snapshot.orgId,
      snapshotDate: snapshot.snapshotDate,
      totalActiveStudents: snapshot.totalActiveStudents,
      activeLearnersTrend: snapshot.activeLearnersTrend,
      activeLearnersSparkline: [...snapshot.activeLearnersSparkline],
      totalActiveTeachers: snapshot.totalActiveTeachers,
      activeTeachersTrend: snapshot.activeTeachersTrend,
      activeTeachersSparkline: [...snapshot.activeTeachersSparkline],
      totalLessonsThisMonth: snapshot.totalLessonsThisMonth,
      totalLessonsLastMonth: snapshot.totalLessonsLastMonth,
      lessonsTrend: snapshot.lessonsTrend,
      lessonsSparkline: [...snapshot.lessonsSparkline],
      avgLessonCompletionRate: snapshot.avgLessonCompletionRate,
      completionRateTrend: snapshot.completionRateTrend,
      completionRateSparkline: [...snapshot.completionRateSparkline],
      avgReportSubmissionTimeHours: snapshot.avgReportSubmissionTimeHours,
      avgReportSubmissionTrend: snapshot.avgReportSubmissionTrend,
      completionBreakdown: snapshot.completionBreakdown,
      weeklyCompletedLessons: [...snapshot.weeklyCompletedLessons],
      teacherPerformance: snapshot.teacherPerformance.map((t) => t.toJSON()),
      studentChurnRisk: snapshot.studentChurnRisk.map((c) => c.toJSON()),
      funnelStages: snapshot.funnelStats.stages,
      funnelStats: snapshot.funnelStats.toJSON(),
      availableSnapshotDates,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }

  private async generateSnapshotForOrg(
    orgId: string,
    targetDate?: Date,
  ): Promise<OrgAnalyticsSnapshot> {
    const date = targetDate ?? new Date();

    // 1. Query active memberships for this organization
    const memberships = await this.prisma.organizationMembership.findMany({
      where: { orgId, status: 'active' },
    });

    const teacherMemberships = memberships.filter((m) =>
      ['Teacher', 'LeadTeacher', 'TeachingAssistant'].includes(m.role),
    );
    const totalActiveTeachers = teacherMemberships.length;

    // 2. Query active student enrollments
    const studentEnrollments = await this.prisma.studentEnrollment.findMany({
      where: { orgId, status: 'active' },
    });
    const distinctStudentIds = Array.from(
      new Set(studentEnrollments.map((e) => e.studentId)),
    );
    const totalActiveStudents = distinctStudentIds.length;

    // 3. Lessons for this month and last month
    const startOfThisMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfThisMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    const startOfLastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      date.getFullYear(),
      date.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const lessonsThisMonth = await this.prisma.lesson.findMany({
      where: {
        orgId,
        scheduledAt: { gte: startOfThisMonth, lte: endOfThisMonth },
      },
    });

    const lessonsLastMonth = await this.prisma.lesson.findMany({
      where: {
        orgId,
        scheduledAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    const totalLessonsThisMonth = lessonsThisMonth.length;
    const totalLessonsLastMonth = lessonsLastMonth.length;

    const completedLessonsThisMonth = lessonsThisMonth.filter((l) =>
      ['COMPLETED', 'REPORTED', 'ARCHIVED'].includes(l.status),
    );
    const inProgressLessonsThisMonth = lessonsThisMonth.filter((l) =>
      ['LIVE', 'MARKING'].includes(l.status),
    );
    const notStartedLessonsThisMonth = lessonsThisMonth.filter((l) =>
      ['PENDING', 'SCHEDULED'].includes(l.status),
    );

    const avgLessonCompletionRate =
      totalLessonsThisMonth > 0
        ? Number(
            (
              (completedLessonsThisMonth.length / totalLessonsThisMonth) *
              100
            ).toFixed(1),
          )
        : 0;

    const completedPercentage =
      totalLessonsThisMonth > 0
        ? Number(
            (
              (completedLessonsThisMonth.length / totalLessonsThisMonth) *
              100
            ).toFixed(1),
          )
        : 0;

    const inProgressPercentage =
      totalLessonsThisMonth > 0
        ? Number(
            (
              (inProgressLessonsThisMonth.length / totalLessonsThisMonth) *
              100
            ).toFixed(1),
          )
        : 0;

    const notStartedPercentage =
      totalLessonsThisMonth > 0
        ? Number(
            (
              (notStartedLessonsThisMonth.length / totalLessonsThisMonth) *
              100
            ).toFixed(1),
          )
        : 0;

    // 4. Report submission time
    const reportsThisMonth = await this.prisma.lessonReport.findMany({
      where: {
        orgId,
        submittedAt: { not: null, gte: startOfThisMonth, lte: endOfThisMonth },
      },
    });

    const avgReportSubmissionTimeHours =
      reportsThisMonth.length > 0
        ? Number(
            (
              reportsThisMonth.reduce((acc, r) => {
                const diffMs = r.submittedAt!.getTime() - r.createdAt.getTime();
                return acc + diffMs / (1000 * 60 * 60);
              }, 0) / reportsThisMonth.length
            ).toFixed(1),
          )
        : 0;

    // 5. Weekly Completed Lessons (Weeks 1 to 4)
    const completedLessonsLastMonth = lessonsLastMonth.filter((l) =>
      ['COMPLETED', 'REPORTED', 'ARCHIVED'].includes(l.status),
    );

    const weeklyCompletedLessons = [1, 2, 3, 4].map((weekNum) => {
      const startDay = (weekNum - 1) * 7 + 1;
      const endDay = weekNum === 4 ? 31 : weekNum * 7;

      const thisMonthCount = completedLessonsThisMonth.filter((l) => {
        const d = l.scheduledAt.getDate();
        return d >= startDay && d <= endDay;
      }).length;

      const lastMonthCount = completedLessonsLastMonth.filter((l) => {
        const d = l.scheduledAt.getDate();
        return d >= startDay && d <= endDay;
      }).length;

      return {
        week: `Week ${weekNum}`,
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
      };
    });

    // 6. Teacher Performance (only real teachers from database)
    const userIds = teacherMemberships.map((m) => m.userId);
    const users =
      userIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: userIds } },
          })
        : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const teacherPerformance: TeacherPerformanceStat[] = [];
    for (const m of teacherMemberships.slice(0, 5)) {
      const u = userMap.get(m.userId);
      const name = u
        ? `${u.firstName} ${u.lastName}`.trim()
        : `Teacher ${m.userId.slice(0, 5)}`;
      const teacherLessons = lessonsThisMonth.filter(
        (l) => l.teacherId === m.userId,
      );
      const delivered = teacherLessons.filter((l) =>
        ['COMPLETED', 'REPORTED', 'ARCHIVED'].includes(l.status),
      ).length;
      const completionRate =
        teacherLessons.length > 0
          ? Math.round((delivered / teacherLessons.length) * 100)
          : 0;

      const teacherReports = reportsThisMonth.filter(
        (r) => r.teacherId === m.userId,
      );
      const avgReportHours =
        teacherReports.length > 0
          ? Number(
              (
                teacherReports.reduce((acc, r) => {
                  const diffMs =
                    r.submittedAt!.getTime() - r.createdAt.getTime();
                  return acc + diffMs / (1000 * 60 * 60);
                }, 0) / teacherReports.length
              ).toFixed(1),
            )
          : 0;

      teacherPerformance.push(
        TeacherPerformanceStat.create({
          teacherId: m.userId,
          teacherName: name,
          teacherRole: m.role === 'LeadTeacher' ? 'Lead Teacher' : 'Teacher',
          avatarUrl: u?.image ?? null,
          lessonsDelivered: delivered,
          avgReportSubmissionHours: avgReportHours,
          avgStudentScorePercent: 0,
          reportCompletionRate: completionRate,
          studentRetentionRate: 0,
          completionRate,
        }),
      );
    }

    // 7. Student Churn Risk (real query from StudentProgressSummary)
    const summaries = await this.prisma.studentProgressSummary.findMany({
      where: { orgId },
      orderBy: { averageScorePercent: 'asc' },
      take: 5,
    });

    const atRiskSummaries = summaries.filter(
      (s) =>
        (s.averageScorePercent !== null && s.averageScorePercent < 75) ||
        (s.lastLessonAt &&
          Date.now() - s.lastLessonAt.getTime() > 3 * 24 * 60 * 60 * 1000),
    );

    const studentUserIds = atRiskSummaries.map((s) => s.studentId);
    const studentUsers =
      studentUserIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: studentUserIds } },
          })
        : [];
    const studentUserMap = new Map(studentUsers.map((u) => [u.id, u]));

    const studentChurnRisk: StudentChurnRisk[] = atRiskSummaries.map((s) => {
      const u = studentUserMap.get(s.studentId);
      const studentName = u
        ? `${u.firstName} ${u.lastName}`.trim()
        : `Student ${s.studentId.slice(0, 5)}`;
      const avgScore = s.averageScorePercent
        ? Math.round(s.averageScorePercent)
        : 0;
      const isHighRisk = avgScore < 50;

      const daysInactive = s.lastLessonAt
        ? Math.floor(
            (Date.now() - s.lastLessonAt.getTime()) / (24 * 60 * 60 * 1000),
          )
        : 0;
      const reason =
        daysInactive > 3
          ? `Low activity · ${daysInactive} days inactive`
          : 'Below average performance';

      return StudentChurnRisk.create({
        studentId: s.studentId,
        studentName,
        avatarUrl: u?.image ?? null,
        gradeSubject: '',
        riskLevel: isHighRisk ? 'high' : 'medium',
        reason,
        avgScorePercent: avgScore,
        riskScore: isHighRisk ? 0.85 : 0.55,
        riskFactors: [reason],
        lastLessonAt: s.lastLessonAt ?? undefined,
      });
    });

    // 8. Funnel Stats (real counts from invitations & enrollments)
    const totalInvitations = await this.prisma.organizationInvitation.count({
      where: { orgId },
    });
    const registeredInvitations =
      await this.prisma.organizationInvitation.count({
        where: { orgId, status: 'accepted' },
      });
    const engagedStudents = await this.prisma.studentEnrollment.count({
      where: {
        orgId,
        status: 'active',
        enrolledAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    const funnelBase =
      totalInvitations > 0
        ? totalInvitations
        : totalActiveStudents > 0
          ? totalActiveStudents
          : 0;

    const funnelStats = EnrollmentFunnelStat.create({
      totalLeads: totalInvitations,
      trialLessonsBooked: registeredInvitations,
      trialLessonsCompleted: totalActiveStudents,
      enrolledStudents: engagedStudents,
      conversionRate:
        funnelBase > 0
          ? Number(((engagedStudents / funnelBase) * 100).toFixed(1))
          : 0,
      stages: [
        {
          stage: 'Invited',
          count: totalInvitations,
          percentage:
            funnelBase > 0
              ? Number(((totalInvitations / funnelBase) * 100).toFixed(1))
              : 0,
        },
        {
          stage: 'Registered',
          count: registeredInvitations,
          percentage:
            funnelBase > 0
              ? Number(((registeredInvitations / funnelBase) * 100).toFixed(1))
              : 0,
        },
        {
          stage: 'Active',
          count: totalActiveStudents,
          percentage:
            funnelBase > 0
              ? Number(((totalActiveStudents / funnelBase) * 100).toFixed(1))
              : 0,
        },
        {
          stage: 'Engaged (last 7 days)',
          count: engagedStudents,
          percentage:
            funnelBase > 0
              ? Number(((engagedStudents / funnelBase) * 100).toFixed(1))
              : 0,
        },
      ],
    });

    // 9. Trends & Sparklines
    const lessonsTrend =
      totalLessonsLastMonth > 0
        ? Number(
            (
              ((totalLessonsThisMonth - totalLessonsLastMonth) /
                totalLessonsLastMonth) *
              100
            ).toFixed(1),
          )
        : totalLessonsThisMonth > 0
          ? 100
          : 0;

    const snapshot = OrgAnalyticsSnapshot.create({
      orgId,
      snapshotDate: date,
      totalActiveStudents,
      totalActiveTeachers,
      totalLessonsThisMonth,
      totalLessonsLastMonth,
      avgLessonCompletionRate,
      avgReportSubmissionTimeHours,
      activeLearnersTrend: 0,
      activeLearnersSparkline: totalActiveStudents > 0 ? [totalActiveStudents] : [],
      activeTeachersTrend: 0,
      activeTeachersSparkline: totalActiveTeachers > 0 ? [totalActiveTeachers] : [],
      lessonsTrend,
      lessonsSparkline: totalLessonsThisMonth > 0 ? [totalLessonsThisMonth] : [],
      completionRateTrend: 0,
      completionRateSparkline: avgLessonCompletionRate > 0 ? [avgLessonCompletionRate] : [],
      weeklyCompletedLessons,
      avgReportSubmissionTrend: 0,
      completionBreakdown: {
        completedPercentage,
        inProgressPercentage,
        notStartedPercentage,
      },
      teacherPerformance,
      studentChurnRisk,
      funnelStats,
    });

    await this.snapshotRepository.save(snapshot);
    return snapshot;
  }
}
