import { Injectable } from '@nestjs/common';
import {
  IClassroomQueryPort,
  SharedClassroomDto,
  SharedLessonDto,
} from '@modules/shared';
import {
  IClassroomRepository,
  ILessonRepository,
  IStudentEnrollmentRepository,
  EnrollmentStatus,
} from '../../domain';

@Injectable()
export class ClassroomQueryAdapter implements IClassroomQueryPort {
  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly lessonRepository: ILessonRepository,
    private readonly enrollmentRepository: IStudentEnrollmentRepository,
  ) {}

  async getClassroomById(id: string): Promise<SharedClassroomDto | null> {
    const classroom = await this.classroomRepository.findById(id);
    if (!classroom) return null;
    return {
      id: classroom.id.value,
      orgId: classroom.orgId,
      name: classroom.name,
      subjectId: classroom.subjectId,
      primaryTeacherId: classroom.primaryTeacherId,
      status: classroom.status,
      lessonDurationMins: classroom.lessonDurationMins,
      maxStudents: classroom.maxStudents,
    };
  }

  async getLessonById(id: string): Promise<SharedLessonDto | null> {
    const lesson = await this.lessonRepository.findById(id);
    if (!lesson) return null;
    return {
      id: lesson.id.value,
      orgId: lesson.orgId,
      classroomId: lesson.classroomId,
      teacherId: lesson.teacherId,
      coverTeacherId: lesson.coverTeacherId,
      scheduledAt: lesson.scheduledAt,
      durationMins: lesson.durationMins,
      status: lesson.status,
      meetingId: lesson.meetingId,
      videoProvider: lesson.videoProvider,
      meetLink: lesson.meetLink,
    };
  }

  async isStudentEnrolled(
    classroomId: string,
    studentId: string,
  ): Promise<boolean> {
    const enrollment =
      await this.enrollmentRepository.findByClassroomAndStudent(
        classroomId,
        studentId,
      );
    return !!enrollment && enrollment.status === EnrollmentStatus.ACTIVE;
  }

  async getStudentClassrooms(
    studentId: string,
  ): Promise<SharedClassroomDto[]> {
    const enrollments = await this.enrollmentRepository.findByStudentId(
      studentId,
    );
    const activeClassroomIds = enrollments
      .filter((e) => e.status === EnrollmentStatus.ACTIVE)
      .map((e) => e.classroomId);

    const classrooms: SharedClassroomDto[] = [];
    for (const cId of activeClassroomIds) {
      const c = await this.getClassroomById(cId);
      if (c) classrooms.push(c);
    }
    return classrooms;
  }
}
