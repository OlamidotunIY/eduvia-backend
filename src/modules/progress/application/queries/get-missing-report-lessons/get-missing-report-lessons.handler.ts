import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@modules/shared';
import { GetMissingReportLessonsQuery } from './get-missing-report-lessons.query';
import { MissingReportLessonItemDto } from './missing-report-lessons.dto';

@QueryHandler(GetMissingReportLessonsQuery)
export class GetMissingReportLessonsHandler
  implements
    IQueryHandler<GetMissingReportLessonsQuery, MissingReportLessonItemDto[]>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetMissingReportLessonsQuery,
  ): Promise<MissingReportLessonItemDto[]> {
    const { orgId, filters } = query;
    const now = new Date();

    // 1. Fetch existing report lesson IDs & subjects in parallel
    const [existingReports, orgSubjects] = await Promise.all([
      this.prisma.lessonReport.findMany({
        where: { orgId },
        select: { lessonId: true },
      }),
      this.prisma.organizationSubject.findMany({
        where: { orgId },
        select: { id: true, name: true },
      }),
    ]);

    const reportedLessonIds = existingReports.map((r) => r.lessonId);
    const subjectMap = new Map(orgSubjects.map((s) => [s.id, s.name]));

    // 2. Fetch past / completed lessons without a report
    const lessons = await this.prisma.lesson.findMany({
      where: {
        orgId,
        ...(filters?.classroomId ? { classroomId: filters.classroomId } : {}),
        ...(filters?.teacherId ? { teacherId: filters.teacherId } : {}),
        ...(reportedLessonIds.length > 0
          ? { id: { notIn: reportedLessonIds } }
          : {}),
        OR: [
          { status: { in: ['COMPLETED', 'MARKING'] } },
          { status: 'SCHEDULED', scheduledAt: { lt: now } },
        ],
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            subjectId: true,
            enrollments: {
              where: { status: 'active' },
              select: { studentId: true },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    if (lessons.length === 0) {
      return [];
    }

    // 3. Batch fetch teachers and enrolled students
    const userIds = Array.from(
      new Set([
        ...lessons.map((l) => l.teacherId),
        ...lessons.flatMap((l) =>
          l.classroom.enrollments.map((e) => e.studentId),
        ),
      ]),
    );

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    // 4. Map results
    let items: MissingReportLessonItemDto[] = lessons.map((l) => {
      const teacher = userMap.get(l.teacherId);
      const teacherName = teacher
        ? `${teacher.firstName} ${teacher.lastName}`.trim()
        : 'Instructor';

      const students = l.classroom.enrollments
        .map((e) => userMap.get(e.studentId))
        .filter((u): u is NonNullable<typeof u> => Boolean(u))
        .map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          image: u.image ?? null,
        }));

      return {
        lessonId: l.id,
        classroomId: l.classroomId,
        classroomName: l.classroom.name,
        subjectId: l.classroom.subjectId,
        subjectName: subjectMap.get(l.classroom.subjectId) ?? 'Subject',
        teacherId: l.teacherId,
        teacherName,
        teacherAvatar: teacher?.image ?? null,
        scheduledAt: l.scheduledAt.toISOString(),
        durationMins: l.durationMins,
        status: l.status,
        students,
      };
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.classroomName.toLowerCase().includes(q) ||
          i.subjectName.toLowerCase().includes(q) ||
          i.teacherName.toLowerCase().includes(q) ||
          i.students.some(
            (s) =>
              `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
              s.email.toLowerCase().includes(q),
          ),
      );
    }

    return items;
  }
}
