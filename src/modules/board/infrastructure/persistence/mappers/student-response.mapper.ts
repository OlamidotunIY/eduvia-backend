import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  StudentResponse,
  StudentResponseId,
  ResponseType,
  AutoMarkResult,
  TeacherMark,
} from '../../../domain';
import { StudentResponse as PrismaStudentResponse } from '@generated/prisma/client';

@Injectable()
export class StudentResponseMapper implements IMapper<StudentResponse, PrismaStudentResponse> {
  toDomain(record: PrismaStudentResponse): StudentResponse {
    let autoMarkResult: AutoMarkResult | null = null;
    if (record.autoMarksAwarded !== null && record.autoMarksAwarded !== undefined && record.autoMarkedAt) {
      autoMarkResult = AutoMarkResult.create(
        record.autoIsCorrect ?? false,
        record.autoMarksAwarded,
        record.autoMarkedAt,
      );
    }

    let teacherMark: TeacherMark | null = null;
    if (
      record.teacherMarksAwarded !== null &&
      record.teacherMarksAwarded !== undefined &&
      record.teacherMaxMarks !== null &&
      record.teacherMaxMarks !== undefined &&
      record.teacherMarkedBy &&
      record.teacherMarkedAt
    ) {
      teacherMark = TeacherMark.create(
        record.teacherMarksAwarded,
        record.teacherMaxMarks,
        record.teacherMarkedBy,
        record.teacherFeedback,
        record.teacherMarkedAt,
      );
    }

    return StudentResponse.reconstitute({
      id: StudentResponseId.from(record.id),
      boardQuestionId: record.boardQuestionId,
      studentId: record.studentId,
      responseType: record.responseType as ResponseType,
      textContent: record.textContent,
      imageUrl: record.imageUrl,
      selectedOption: record.selectedOption,
      submittedAt: record.submittedAt,
      autoMarkResult,
      teacherMark,
    });
  }

  toPersistence(entity: StudentResponse): Omit<PrismaStudentResponse, 'id'> {
    return {
      boardQuestionId: entity.boardQuestionId,
      studentId: entity.studentId,
      responseType: entity.responseType as any,
      textContent: entity.textContent ?? null,
      imageUrl: entity.imageUrl ?? null,
      selectedOption: entity.selectedOption ?? null,
      submittedAt: entity.submittedAt,
      autoIsCorrect: entity.autoMarkResult ? entity.autoMarkResult.isCorrect : null,
      autoMarksAwarded: entity.autoMarkResult ? entity.autoMarkResult.marksAwarded : null,
      autoMarkedAt: entity.autoMarkResult ? entity.autoMarkResult.markedAt : null,
      teacherMarksAwarded: entity.teacherMark ? entity.teacherMark.marksAwarded : null,
      teacherMaxMarks: entity.teacherMark ? entity.teacherMark.maxMarks : null,
      teacherFeedback: entity.teacherMark ? entity.teacherMark.feedback ?? null : null,
      teacherMarkedBy: entity.teacherMark ? entity.teacherMark.markedBy : null,
      teacherMarkedAt: entity.teacherMark ? entity.teacherMark.markedAt : null,
    };
  }
}
