import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  OrgAnalyticsSnapshot,
  OrgAnalyticsSnapshotId,
  TeacherPerformanceStat,
  StudentChurnRisk,
  EnrollmentFunnelStat,
} from '../../../domain';
import { OrgAnalyticsSnapshot as PrismaOrgAnalyticsSnapshot } from '@generated/prisma/client';

@Injectable()
export class OrgAnalyticsSnapshotMapper
  implements IMapper<OrgAnalyticsSnapshot, PrismaOrgAnalyticsSnapshot>
{
  toDomain(record: PrismaOrgAnalyticsSnapshot): OrgAnalyticsSnapshot {
    const rawTeacherPerf = Array.isArray(record.teacherPerformance)
      ? (record.teacherPerformance as any[])
      : [];
    const teacherPerformance = rawTeacherPerf.map((t) =>
      TeacherPerformanceStat.create({
        teacherId: t.teacherId,
        teacherName: t.teacherName,
        teacherRole: t.teacherRole,
        avatarUrl: t.avatarUrl ?? null,
        lessonsDelivered: t.lessonsDelivered ?? 0,
        avgReportSubmissionHours: t.avgReportSubmissionHours ?? 0,
        avgStudentScorePercent: t.avgStudentScorePercent ?? null,
        reportCompletionRate: t.reportCompletionRate ?? t.completionRate ?? 0,
        studentRetentionRate: t.studentRetentionRate ?? 0,
        completionRate: t.completionRate ?? t.reportCompletionRate ?? 0,
      }),
    );

    const rawChurnRisk = Array.isArray(record.studentChurnRisk)
      ? (record.studentChurnRisk as any[])
      : [];
    const studentChurnRisk = rawChurnRisk.map((c) =>
      StudentChurnRisk.create({
        studentId: c.studentId,
        studentName: c.studentName,
        avatarUrl: c.avatarUrl ?? null,
        gradeSubject: c.gradeSubject,
        riskLevel: c.riskLevel,
        reason: c.reason,
        avgScorePercent: c.avgScorePercent,
        riskScore: c.riskScore ?? 0,
        riskFactors: c.riskFactors || [],
        lastLessonAt: c.lastLessonAt ? new Date(c.lastLessonAt) : null,
      }),
    );

    const rawFunnel = (record.funnelStats as any) || {};
    const funnelStats = EnrollmentFunnelStat.create({
      totalLeads: rawFunnel.totalLeads ?? 0,
      trialLessonsBooked: rawFunnel.trialLessonsBooked ?? 0,
      trialLessonsCompleted: rawFunnel.trialLessonsCompleted ?? 0,
      enrolledStudents: rawFunnel.enrolledStudents ?? 0,
      conversionRate: rawFunnel.conversionRate ?? 0,
      stages: rawFunnel.stages,
    });

    const trends = rawFunnel.trends || {};

    return OrgAnalyticsSnapshot.reconstitute({
      id: OrgAnalyticsSnapshotId.from(record.id),
      orgId: record.orgId,
      snapshotDate: record.snapshotDate,
      totalActiveStudents: record.totalActiveStudents,
      totalActiveTeachers: record.totalActiveTeachers,
      totalLessonsThisMonth: record.totalLessonsThisMonth,
      totalLessonsLastMonth: record.totalLessonsLastMonth,
      avgLessonCompletionRate: record.avgLessonCompletionRate,
      avgReportSubmissionTimeHours: record.avgReportSubmissionTimeHours,
      activeLearnersTrend: trends.activeLearnersTrend,
      activeLearnersSparkline: trends.activeLearnersSparkline,
      activeTeachersTrend: trends.activeTeachersTrend,
      activeTeachersSparkline: trends.activeTeachersSparkline,
      lessonsTrend: trends.lessonsTrend,
      lessonsSparkline: trends.lessonsSparkline,
      completionRateTrend: trends.completionRateTrend,
      completionRateSparkline: trends.completionRateSparkline,
      weeklyCompletedLessons: rawFunnel.weeklyCompletedLessons,
      avgReportSubmissionTrend: trends.avgReportSubmissionTrend,
      completionBreakdown: rawFunnel.completionBreakdown,
      teacherPerformance,
      studentChurnRisk,
      funnelStats,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(
    entity: OrgAnalyticsSnapshot,
  ): Omit<PrismaOrgAnalyticsSnapshot, 'id'> {
    const funnelPayload = {
      ...entity.funnelStats.toJSON(),
      stages: entity.funnelStats.stages,
      weeklyCompletedLessons: entity.weeklyCompletedLessons,
      completionBreakdown: entity.completionBreakdown,
      trends: {
        activeLearnersTrend: entity.activeLearnersTrend,
        activeLearnersSparkline: entity.activeLearnersSparkline,
        activeTeachersTrend: entity.activeTeachersTrend,
        activeTeachersSparkline: entity.activeTeachersSparkline,
        lessonsTrend: entity.lessonsTrend,
        lessonsSparkline: entity.lessonsSparkline,
        completionRateTrend: entity.completionRateTrend,
        completionRateSparkline: entity.completionRateSparkline,
        avgReportSubmissionTrend: entity.avgReportSubmissionTrend,
      },
    };

    return {
      orgId: entity.orgId,
      snapshotDate: entity.snapshotDate,
      totalActiveStudents: entity.totalActiveStudents,
      totalActiveTeachers: entity.totalActiveTeachers,
      totalLessonsThisMonth: entity.totalLessonsThisMonth,
      totalLessonsLastMonth: entity.totalLessonsLastMonth,
      avgLessonCompletionRate: entity.avgLessonCompletionRate,
      avgReportSubmissionTimeHours: entity.avgReportSubmissionTimeHours,
      teacherPerformance: entity.teacherPerformance.map((t) => t.toJSON()) as any,
      studentChurnRisk: entity.studentChurnRisk.map((c) => c.toJSON()) as any,
      funnelStats: funnelPayload as any,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
