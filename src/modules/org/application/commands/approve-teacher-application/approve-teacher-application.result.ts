export interface ApproveTeacherApplicationResult {
  id: string;
  status: string;
  approvedSubjects: string[];
  role: string;
  roleId: string | null;
}
