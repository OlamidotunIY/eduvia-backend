export enum UserType {
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
}

export interface UserDTO {
  id: string;
  userType: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  onboardingStatus: string;
  timezone: string;
  image: string | null;
  activeOrganizationId: string | null;
}

export interface StudentCurriculumContextDto {
  studentId: string;
  countryCode: string;
  gradeLevel: string | null;
}

export abstract class IUserQueryPort {
  abstract getUserByEmail(email: string): Promise<UserDTO | null>;
  abstract getUserById(id: string): Promise<UserDTO | null>;
  abstract getUsersByIds(ids: string[]): Promise<UserDTO[]>;
  abstract getStudentCountryCodes(studentIds: string[]): Promise<string[]>;
  abstract getStudentCurriculumContexts(
    studentIds: string[],
  ): Promise<StudentCurriculumContextDto[]>;
}
