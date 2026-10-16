import { ResponseType } from '../../../domain';

export interface SubmitStudentResponsePayload {
  boardQuestionId: string;
  studentId: string;
  responseType: ResponseType;
  textContent?: string | null;
  imageUrl?: string | null;
  selectedOption?: string | null;
  correlationId?: string;
}

export class SubmitStudentResponseCommand {
  constructor(public readonly payload: SubmitStudentResponsePayload) {}
}
