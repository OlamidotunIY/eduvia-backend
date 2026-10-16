import { BaseRepository } from '@modules/shared';
import { StudentResponseId } from '../value-objects';
import { StudentResponse } from '../entities/student-response.entity';

export abstract class IStudentResponseRepository extends BaseRepository<StudentResponse, StudentResponseId> {
  public abstract findByBoardQuestionId(boardQuestionId: string): Promise<StudentResponse[]>;
  public abstract findByQuestionAndStudent(boardQuestionId: string, studentId: string): Promise<StudentResponse | null>;
}
