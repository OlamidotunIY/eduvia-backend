export interface TeacherApplicationDTO {
  id: string;
  orgId: string;
  applicantUserId: string;
  appliedSubjects: string[];
  status: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  coverLetter: string | null;
  qualifications: string | null;
  createdAt: Date;
  updatedAt: Date;
}
