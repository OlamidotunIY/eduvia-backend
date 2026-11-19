import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParentStudentsQuery } from './get-parent-students.query';
import { PrismaService } from '@modules/shared';

export interface ParentChildDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string | null;
  dateOfBirth: string;
  gradeLevel: string;
  countryCode: string;
  timezone: string;
  avatarUrl: string;
  enrolledSubjects: string[];
  attendanceRate: number;
  completedLessonsCount: number;
  masteryPercentage: number;
  createdAt: string;
}

@Injectable()
@QueryHandler(GetParentStudentsQuery)
export class GetParentStudentsHandler
  implements IQueryHandler<GetParentStudentsQuery, ParentChildDto[]>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetParentStudentsQuery): Promise<ParentChildDto[]> {
    const parent = await this.prisma.parentProfile.findUnique({
      where: { userId: query.parentUserId },
    });

    if (!parent) {
      return [];
    }

    const profiles = await this.prisma.studentProfile.findMany({
      where: { parentId: parent.id },
      orderBy: { createdAt: 'desc' },
    });

    if (profiles.length === 0) {
      return [];
    }

    const studentIds = profiles.map((p) => p.id);

    const [users, enrollments, summaries] = await Promise.all([
      this.prisma.user.findMany({
        where: { id: { in: studentIds } },
      }),
      this.prisma.studentEnrollment.findMany({
        where: { studentId: { in: studentIds }, status: 'active' },
        include: { classroom: true },
      }),
      this.prisma.studentProgressSummary.findMany({
        where: { studentId: { in: studentIds } },
      }),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));

    const subjectIds = [
      ...new Set(enrollments.map((e) => e.classroom.subjectId).filter(Boolean)),
    ];
    const subjects =
      subjectIds.length > 0
        ? await this.prisma.platformSubject.findMany({
            where: { id: { in: subjectIds } },
          })
        : [];
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

    return profiles.map((profile) => {
      const user = userMap.get(profile.id);
      const childEnrollments = enrollments.filter(
        (e) => e.studentId === profile.id,
      );
      const enrolledSubjectNames = childEnrollments.map(
        (e) =>
          subjectMap.get(e.classroom.subjectId) || e.classroom.name || 'General Studies',
      );

      const childSummaries = summaries.filter(
        (s) => s.studentId === profile.id,
      );
      const totalLessons = childSummaries.reduce(
        (acc, s) => acc + s.totalLessonsAttended + s.totalLessonsMissed,
        0,
      );
      const totalAttended = childSummaries.reduce(
        (acc, s) => acc + s.totalLessonsAttended,
        0,
      );
      const attendanceRate =
        totalLessons > 0 ? Math.round((totalAttended / totalLessons) * 100) : 100;

      const validScores = childSummaries
        .map((s) => s.averageScorePercent)
        .filter((v): v is number => v !== null && v !== undefined);
      const masteryPercentage =
        validScores.length > 0
          ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
          : 75;

      return {
        id: profile.id,
        firstName: user?.firstName || 'Learner',
        lastName: user?.lastName || '',
        email: user?.email || '',
        username: user?.username || null,
        dateOfBirth: profile.dateOfBirth.toISOString().split('T')[0],
        gradeLevel: profile.gradeLevel || 'Standard Grade',
        countryCode: profile.countryCode,
        timezone: profile.timezone,
        avatarUrl: user?.image || '',
        enrolledSubjects:
          enrolledSubjectNames.length > 0
            ? enrolledSubjectNames
            : ['Foundation Track'],
        attendanceRate,
        completedLessonsCount: totalAttended,
        masteryPercentage,
        createdAt: profile.createdAt.toISOString(),
      };
    });
  }
}
