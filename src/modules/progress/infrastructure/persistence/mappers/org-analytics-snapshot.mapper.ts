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
        lessonsDelivered: t.lessonsDelivered,
        avgReportSubmissionHours: t.avgReportSubmissionHours,
        avgStudentScorePercent: t.avgStudentScorePercent ?? null,
        reportCompletionRate: t.reportCompletionRate,
        studentRetentionRate: t.studentRetentionRate,
      }),
    );

    const rawChurnRisk = Array.isArray(record.studentChurnRisk)
      ? (record.studentChurnRisk as any[])
      : [];
    const studentChurnRisk = rawChurnRisk.map((c) =>
      StudentChurnRisk.create({
        studentId: c.studentId,
        studentName: c.studentName,
        riskScore: c.riskScore,
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
    });

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
      funnelStats: entity.funnelStats.toJSON() as any,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
