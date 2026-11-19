import { UserId } from "../../../domain";

export interface RegisterStudentPayload {
  parentUserId: UserId;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  passwordRaw: string;
  dateOfBirth: Date;
  countryCode?: string;
  timezone?: string;
  gradeLevel?: string;
}

export interface RegisterStudentResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gradeLevel?: string | null;
}
