import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@modules/shared';
import { GetOrgReportsQuery } from './get-org-reports.query';
import { OrgReportItemDto, OrgReportsResponseDto } from './org-reports.dto';

@QueryHandler(GetOrgReportsQuery)
export class GetOrgReportsHandler
  implements IQueryHandler<GetOrgReportsQuery, OrgReportsResponseDto>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetOrgReportsQuery): Promise<OrgReportsResponseDto> {
    const { orgId, filters } = query;
    const now = new Date();

    // 1. Fetch reports, classrooms, subjects, and candidate past lessons in parallel
    const [allReports, orgClassrooms, orgSubjects, pastLessons] = await Promise.all([
      this.prisma.lessonReport.findMany({
        where: { orgId },
        include: {
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.classroom.findMany({
        where: { orgId, status: 'active' },
        select: { id: true, name: true, subjectId: true },
      }),
      this.prisma.organizationSubject.findMany({
        where: { orgId, isActive: true },
        select: { id: true, name: true },
      }),
      this.prisma.lesson.findMany({
        where: {
          orgId,
          OR: [
            { status: { in: ['COMPLETED', 'MARKING'] } },
            { status: 'SCHEDULED', scheduledAt: { lt: now } },
          ],
        },
        select: { id: true },
      }),
    ]);

    const reportedLessonIds = new Set(allReports.map((r) => r.lessonId));
    const totalMissingLessons = pastLessons.filter(
      (l) => !reportedLessonIds.has(l.id),
    ).length;

    // 2. Compute aggregate KPIs across non-archived reports
    const activeReports = allReports.filter((r) => r.status !== 'archived');
    const total = activeReports.length;
    const totalDraft = activeReports.filter((r) => r.status === 'draft').length;
    const totalNeedsReview = activeReports.filter((r) =>
      ['draft', 'ai_draft', 'teacher_reviewing'].includes(r.status),
    ).length;
    const totalSubmitted = activeReports.filter(
      (r) => r.status === 'submitted',
    ).length;

    const ratedReports = activeReports.filter(
      (r) => r.overallRating !== null && r.overallRating !== undefined,
    );
    const averageRating =
      ratedReports.length > 0
        ? Math.round(
            (ratedReports.reduce((acc, r) => acc + (r.overallRating ?? 0), 0) /
              ratedReports.length) *
              10,
          ) / 10
        : null;

    const classroomMap = new Map(orgClassrooms.map((c) => [c.id, c]));
    const subjectMap = new Map(orgSubjects.map((s) => [s.id, s]));

    if (allReports.length === 0) {
      return {
        reports: [],
        meta: {
          total: 0,
          totalDraft: 0,
          totalNeedsReview: 0,
          totalSubmitted: 0,
          totalMissingLessons,
          averageRating: null,
          classrooms: orgClassrooms.map((c) => ({ id: c.id, name: c.name })),
          subjects: orgSubjects.map((s) => ({ id: s.id, name: s.name })),
        },
      };
    }

    // 3. Batch fetch users (teachers & students) and lessons
    const userIds = Array.from(
      new Set([
        ...allReports.map((r) => r.teacherId),
        ...allReports.map((r) => r.studentId),
      ]),
    );
    const lessonIds = Array.from(new Set(allReports.map((r) => r.lessonId)));

    // Also include classrooms that might be inactive/archived if referenced by a report
    const missingClassroomIds = Array.from(
      new Set(
        allReports
          .map((r) => r.classroomId)
          .filter((id) => !classroomMap.has(id)),
      ),
    );

    const [users, lessons, extraClassrooms] = await Promise.all([
      this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      }),
      this.prisma.lesson.findMany({
        where: { id: { in: lessonIds } },
        select: { id: true, scheduledAt: true },
      }),
      missingClassroomIds.length > 0
        ? this.prisma.classroom.findMany({
            where: { id: { in: missingClassroomIds } },
            select: { id: true, name: true, subjectId: true },
          })
        : Promise.resolve([]),
    ]);

    for (const c of extraClassrooms) {
      classroomMap.set(c.id, c);
    }

    const userMap = new Map(users.map((u) => [u.id, u]));
    const lessonMap = new Map(lessons.map((l) => [l.id, l]));

    // 4. Map & apply filters
    let items: OrgReportItemDto[] = allReports.map((r) => {
      const classroom = classroomMap.get(r.classroomId);
      const subjectId = classroom?.subjectId ?? '';
      const subject = subjectId ? subjectMap.get(subjectId) : undefined;
      const teacher = userMap.get(r.teacherId);
      const student = userMap.get(r.studentId);
      const lesson = lessonMap.get(r.lessonId);

      const teacherName = teacher
        ? `${teacher.firstName} ${teacher.lastName}`.trim()
        : 'Instructor';
      const studentName = student
        ? `${student.firstName} ${student.lastName}`.trim()
        : 'Learner';

      return {
        id: r.id,
        lessonId: r.lessonId,
        classroomId: r.classroomId,
        classroomName: classroom?.name ?? 'Classroom',
        subjectId,
        subjectName: subject?.name ?? 'Subject',
        teacherId: r.teacherId,
        teacherName,
        teacherAvatar: teacher?.image ?? null,
        studentId: r.studentId,
        studentName,
        studentEmail: student?.email ?? '',
        studentAvatar: student?.image ?? null,
        status: r.status,
        attendanceStatus: r.attendanceStatus,
        overallRating: r.overallRating ?? null,
        scorePercent: r.scorePercent ?? null,
        parentCanView: r.parentCanView,
        hasAiSummary: Boolean(r.aiGeneratedSummary),
        isAiApproved: Boolean(r.teacherApprovedAiSummary),
        commentsCount: r._count.comments,
        lessonScheduledAt: lesson?.scheduledAt
          ? lesson.scheduledAt.toISOString()
          : null,
        submittedAt: r.submittedAt ? r.submittedAt.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    });

    if (filters?.status) {
      if (filters.status === 'needs_review') {
        items = items.filter((i) =>
          ['draft', 'ai_draft', 'teacher_reviewing'].includes(i.status),
        );
      } else {
        items = items.filter((i) => i.status === filters.status);
      }
    } else {
      // By default exclude archived unless explicitly requested
      items = items.filter((i) => i.status !== 'archived');
    }

    if (filters?.classroomId) {
      items = items.filter((i) => i.classroomId === filters.classroomId);
    }

    if (filters?.subjectId) {
      items = items.filter((i) => i.subjectId === filters.subjectId);
    }

    if (filters?.teacherId) {
      items = items.filter((i) => i.teacherId === filters.teacherId);
    }

    if (filters?.studentId) {
      items = items.filter((i) => i.studentId === filters.studentId);
    }

    if (filters?.attendanceStatus) {
      items = items.filter(
        (i) => i.attendanceStatus === filters.attendanceStatus,
      );
    }

    if (filters?.from) {
      const fromDate = new Date(filters.from);
      items = items.filter(
        (i) => new Date(i.lessonScheduledAt ?? i.createdAt) >= fromDate,
      );
    }

    if (filters?.to) {
      const toDate = new Date(filters.to);
      items = items.filter(
        (i) => new Date(i.lessonScheduledAt ?? i.createdAt) <= toDate,
      );
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.studentName.toLowerCase().includes(q) ||
          i.studentEmail.toLowerCase().includes(q) ||
          i.teacherName.toLowerCase().includes(q) ||
          i.classroomName.toLowerCase().includes(q) ||
          i.subjectName.toLowerCase().includes(q),
      );
    }

    return {
      reports: items,
      meta: {
        total,
        totalDraft,
        totalNeedsReview,
        totalSubmitted,
        totalMissingLessons,
        averageRating,
        classrooms: orgClassrooms.map((c) => ({ id: c.id, name: c.name })),
        subjects: orgSubjects.map((s) => ({ id: s.id, name: s.name })),
      },
    };
  }
}
