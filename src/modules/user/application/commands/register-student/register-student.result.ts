import { UserId } from "../../../domain";

export interface RegisterStudentPayload {
  userId: UserId;
  dateOfBirth: Date;
  countryCode: string;
  timezone: string;
  gradeLevel?: string;
}

export interface RegisterStudentResult {
    id: string;
}
