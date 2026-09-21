import { UserId } from "../../../domain";

export interface RegisterStudentPayload {
  userId: UserId;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  countryCode: string;
  timezone: string;
  gradeLevel?: string;
  avatarUrl?: string;
}

export interface RegisterStudentResult {
    id: string;
}
