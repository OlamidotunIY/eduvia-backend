import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@modules/shared';
import { GetOrgStudentsProgressQuery } from './get-org-students-progress.query';
import {
  MasteryTier,
  OrgStudentProgressItemDto,
  OrgStudentsProgressResponseDto,
  StudentClassroomInfoDto,
} from './org-students-progress.dto';

@QueryHandler(GetOrgStudentsProgressQuery)
export class GetOrgStudentsProgressHandler
  implements IQueryHandler<GetOrgStudentsProgressQuery, OrgStudentsProgressResponseDto>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetOrgStudentsProgressQuery,
  ): Promise<OrgStudentsProgressResponseDto> {
    const { orgId, filters } = query;

    // 1. Fetch classrooms and subjects for the organization
    const [orgClassrooms, orgSubjects] = await Promise.all([
      this.prisma.classroom.findMany({
        where: { orgId, status: 'active' },
        select: { id: true, name: true, subjectId: true },
      }),
      this.prisma.organizationSubject.findMany({
        where: { orgId, isActive: true },
        select: { id: true, name: true },
      }),
    ]);

    // 2. Fetch active enrollments with optional classroom filter
    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        orgId,
        status: 'active',
        ...(filters?.classroomId ? { classroomId: filters.classroomId } : {}),
      },
      include: {
        classroom: {
          select: { id: true, name: true, subjectId: true },
        },
      },
    });

    // Group enrollments by studentId
    const studentEnrollmentMap = new Map<string, StudentClassroomInfoDto[]>();
    for (const enrollment of enrollments) {
      const list = studentEnrollmentMap.get(enrollment.studentId) ?? [];
      if (enrollment.classroom) {
        list.push({
          id: enrollment.classroom.id,
          name: enrollment.classroom.name,
          subjectId: enrollment.classroom.subjectId,
        });
      }
      studentEnrollmentMap.set(enrollment.studentId, list);
    }

    const studentIds = Array.from(studentEnrollmentMap.keys());

    const metaBase = {
      classrooms: orgClassrooms.map((c) => ({ id: c.id, name: c.name })),
      subjects: orgSubjects.map((s) => ({ id: s.id, name: s.name })),
    };

    if (studentIds.length === 0) {
      return {
        students: [],
        meta: {
          totalStudents: 0,
          averageMasteryRate: 0,
          totalLessonsAttended: 0,
          studentsNeedingSupport: 0,
          ...metaBase,
        },
      };
    }

    // 3. Batch fetch in parallel: users, student profiles, progress summaries, and submitted reports
    const [users, profiles, progressSummaries, submittedReports] = await Promise.all([
      this.prisma.user.findMany({
        where: { id: { in: studentIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      }),
      this.prisma.studentProfile.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, gradeLevel: true },
      }),
      this.prisma.studentProgressSummary.findMany({
        where: {
          orgId,
          studentId: { in: studentIds },
          ...(filters?.subjectId ? { subjectId: filters.subjectId } : {}),
        },
      }),
      this.prisma.lessonReport.findMany({
        where: {
          orgId,
          studentId: { in: studentIds },
          status: 'submitted',
        },
        select: {
          studentId: true,
          scorePercent: true,
          attendanceStatus: true,
          submittedAt: true,
          overallRating: true,
        },
      }),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));
    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    // Group summaries by studentId
    const summariesByStudent = new Map<string, typeof progressSummaries>();
    for (const summary of progressSummaries) {
      const list = summariesByStudent.get(summary.studentId) ?? [];
      list.push(summary);
      summariesByStudent.set(summary.studentId, list);
    }

    // Group reports by studentId
    const reportsByStudent = new Map<string, typeof submittedReports>();
    for (const report of submittedReports) {
      const list = reportsByStudent.get(report.studentId) ?? [];
      list.push(report);
      reportsByStudent.set(report.studentId, list);
    }

    // 4. Assemble student list
    const searchLower = filters?.search?.trim().toLowerCase();
    const students: OrgStudentProgressItemDto[] = [];

    for (const studentId of studentIds) {
      const user = userMap.get(studentId);
      const profile = profileMap.get(studentId);
      const classrooms = studentEnrollmentMap.get(studentId) ?? [];

      const firstName = user?.firstName ?? 'Student';
      const lastName = user?.lastName ?? studentId.slice(0, 6);
      const email = user?.email ?? '';

      // Check search filter
      if (searchLower) {
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const matchesName = fullName.includes(searchLower);
        const matchesEmail = email.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesEmail) {
          continue;
        }
      }

      const summaries = summariesByStudent.get(studentId) ?? [];
      const studentReports = reportsByStudent.get(studentId) ?? [];

      let totalLessonsAttended = 0;
      let totalLessonsMissed = 0;
      let totalAssessments = 0;
      let scoreSum = 0;
      let scoreCount = 0;
      let masteredTopicsCount = 0;
      let inProgressTopicsCount = 0;
      let notStartedTopicsCount = 0;
      let masteryLevelSum = 0;
      let masteryLevelCount = 0;
      let lastLessonAt: Date | null = null;
      let lastUpdatedAt: Date | null = null;

      if (summaries.length > 0) {
        for (const s of summaries) {
          totalLessonsAttended += s.totalLessonsAttended;
          totalLessonsMissed += s.totalLessonsMissed;
          totalAssessments += s.totalAssessments;
          masteredTopicsCount += s.masteredTopicsCount;
          inProgressTopicsCount += s.inProgressTopicsCount;
          notStartedTopicsCount += s.notStartedTopicsCount;

          if (s.averageScorePercent !== null && s.averageScorePercent !== undefined) {
            scoreSum += s.averageScorePercent;
            scoreCount++;
          }
          if (s.overallMasteryLevel !== null && s.overallMasteryLevel !== undefined) {
            masteryLevelSum += s.overallMasteryLevel;
            masteryLevelCount++;
          }
          if (s.lastLessonAt && (!lastLessonAt || s.lastLessonAt > lastLessonAt)) {
            lastLessonAt = s.lastLessonAt;
          }
          if (s.lastUpdatedAt && (!lastUpdatedAt || s.lastUpdatedAt > lastUpdatedAt)) {
            lastUpdatedAt = s.lastUpdatedAt;
          }
        }
      } else {
        // Fall back to lessonReports if summary record not yet created
        totalLessonsAttended = studentReports.filter(
          (r) => r.attendanceStatus === 'attended',
        ).length;
        totalLessonsMissed = studentReports.filter((r) =>
          ['absent', 'no_show'].includes(r.attendanceStatus),
        ).length;
        totalAssessments = studentReports.length;

        for (const r of studentReports) {
          if (r.scorePercent !== null && r.scorePercent !== undefined) {
            scoreSum += r.scorePercent;
            scoreCount++;
          }
          if (r.submittedAt && (!lastLessonAt || r.submittedAt > lastLessonAt)) {
            lastLessonAt = r.submittedAt;
          }
        }
      }

      const averageScorePercent =
        scoreCount > 0 ? Number((scoreSum / scoreCount).toFixed(1)) : null;
      const overallMasteryLevel =
        masteryLevelCount > 0
          ? Number((masteryLevelSum / masteryLevelCount).toFixed(1))
          : averageScorePercent !== null
            ? averageScorePercent
            : null;

      // Determine mastery tier
      let masteryTier: MasteryTier = 'Needs Support';
      if (overallMasteryLevel !== null) {
        if (overallMasteryLevel >= 80) {
          masteryTier = 'Mastered';
        } else if (overallMasteryLevel >= 65) {
          masteryTier = 'Proficient';
        } else if (overallMasteryLevel >= 45) {
          masteryTier = 'In Progress';
        } else {
          masteryTier = 'Needs Support';
        }
      } else if (totalLessonsAttended > 0) {
        masteryTier = 'In Progress';
      }

      // Check tier filter
      if (filters?.masteryTier && filters.masteryTier !== 'all') {
        const tierFilterLower = filters.masteryTier.toLowerCase();
        if (masteryTier.toLowerCase() !== tierFilterLower) {
          continue;
        }
      }

      students.push({
        studentId,
        firstName,
        lastName,
        email,
        image: user?.image ?? null,
        gradeLevel: profile?.gradeLevel ?? null,
        classrooms,
        summary: {
          totalLessonsAttended,
          totalLessonsMissed,
          totalAssessments,
          averageScorePercent,
          masteredTopicsCount,
          inProgressTopicsCount,
          notStartedTopicsCount,
          overallMasteryLevel,
          masteryTier,
          lastLessonAt,
          lastUpdatedAt,
        },
      });
    }

    // 5. Aggregate KPI meta calculations
    const totalStudents = students.length;
    let totalLessonsAttendedAll = 0;
    let masterySumAll = 0;
    let masteryCountAll = 0;
    let studentsNeedingSupport = 0;

    for (const s of students) {
      totalLessonsAttendedAll += s.summary.totalLessonsAttended;
      if (s.summary.overallMasteryLevel !== null) {
        masterySumAll += s.summary.overallMasteryLevel;
        masteryCountAll++;
      }
      if (
        s.summary.masteryTier === 'Needs Support' ||
        (s.summary.overallMasteryLevel !== null && s.summary.overallMasteryLevel < 50) ||
        s.summary.totalLessonsMissed >= 2
      ) {
        studentsNeedingSupport++;
      }
    }

    const averageMasteryRate =
      masteryCountAll > 0
        ? Number((masterySumAll / masteryCountAll).toFixed(1))
        : 0;

    return {
      students,
      meta: {
        totalStudents,
        averageMasteryRate,
        totalLessonsAttended: totalLessonsAttendedAll,
        studentsNeedingSupport,
        ...metaBase,
      },
    };
  }
}
