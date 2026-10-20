import { AutoMarkResultProps, TeacherMarkProps } from '../../../domain';

export interface StudentResponseDto {
  id: string;
  boardQuestionId: string;
  studentId: string;
  responseType: string;
  textContent: string | null;
  imageUrl: string | null;
  selectedOption: string | null;
  submittedAt: Date;
  autoMarkResult: AutoMarkResultProps | null;
  teacherMark: TeacherMarkProps | null;
}
