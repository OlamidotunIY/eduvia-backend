export class ReceiveTeacherApplicationDTO {
  orgId: string;
  applicantUserId: string;
  appliedSubjects: string[];
  coverLetter?: string | null;
  qualifications?: string | null;
}
