import { OrganizationPermission, OrganizationRoleKey } from '../value-objects';

export type OrganizationRoleDefault = {
  key: OrganizationRoleKey;
  name: string;
  description: string;
  permissions: OrganizationPermission[];
};

const allPermissions = Object.values(OrganizationPermission);

export const ORGANIZATION_ROLE_DEFAULTS: OrganizationRoleDefault[] = [
  {
    key: OrganizationRoleKey.ORG_OWNER,
    name: 'Org Owner',
    description: 'Full organization control, including role administration.',
    permissions: allPermissions,
  },
  {
    key: OrganizationRoleKey.ORG_ADMIN,
    name: 'Org Admin',
    description: 'Organization operations, members, settings, and teaching administration.',
    permissions: allPermissions.filter(
      (permission) => permission !== OrganizationPermission.BILLING_MANAGE,
    ),
  },
  {
    key: OrganizationRoleKey.LEAD_TEACHER,
    name: 'Lead Teacher',
    description: 'Leads teaching delivery, curriculum, assessments, and reporting.',
    permissions: [
      OrganizationPermission.SUBJECTS_READ,
      OrganizationPermission.CLASSROOMS_READ,
      OrganizationPermission.CLASSROOMS_CREATE,
      OrganizationPermission.CLASSROOMS_UPDATE,
      OrganizationPermission.CLASSROOMS_MANAGE_STUDENTS,
      OrganizationPermission.LESSONS_READ,
      OrganizationPermission.LESSONS_SCHEDULE,
      OrganizationPermission.LESSONS_MANAGE,
      OrganizationPermission.CURRICULUM_READ,
      OrganizationPermission.CURRICULUM_MANAGE,
      OrganizationPermission.QUESTIONS_READ,
      OrganizationPermission.QUESTIONS_CREATE,
      OrganizationPermission.QUESTIONS_UPDATE,
      OrganizationPermission.QUESTIONS_DELETE,
      OrganizationPermission.QUESTIONS_PUBLISH,
      OrganizationPermission.ASSESSMENTS_READ,
      OrganizationPermission.ASSESSMENTS_CREATE,
      OrganizationPermission.ASSESSMENTS_MARK,
      OrganizationPermission.ASSESSMENTS_FINALIZE,
      OrganizationPermission.REPORTS_READ,
      OrganizationPermission.REPORTS_CREATE,
      OrganizationPermission.REPORTS_UPDATE,
      OrganizationPermission.REPORTS_SUBMIT,
      OrganizationPermission.REPORTS_APPROVE_AI,
      OrganizationPermission.PROGRESS_READ,
      OrganizationPermission.ANALYTICS_READ,
      OrganizationPermission.CONVERSATIONS_READ,
      OrganizationPermission.CONVERSATIONS_MANAGE,
    ],
  },
  {
    key: OrganizationRoleKey.TEACHER,
    name: 'Teacher',
    description: 'Delivers lessons, creates teaching material, and submits reports.',
    permissions: [
      OrganizationPermission.SUBJECTS_READ,
      OrganizationPermission.CLASSROOMS_READ,
      OrganizationPermission.CLASSROOMS_UPDATE,
      OrganizationPermission.CLASSROOMS_MANAGE_STUDENTS,
      OrganizationPermission.LESSONS_READ,
      OrganizationPermission.LESSONS_SCHEDULE,
      OrganizationPermission.LESSONS_MANAGE,
      OrganizationPermission.CURRICULUM_READ,
      OrganizationPermission.QUESTIONS_READ,
      OrganizationPermission.QUESTIONS_CREATE,
      OrganizationPermission.QUESTIONS_UPDATE,
      OrganizationPermission.ASSESSMENTS_READ,
      OrganizationPermission.ASSESSMENTS_CREATE,
      OrganizationPermission.ASSESSMENTS_MARK,
      OrganizationPermission.REPORTS_READ,
      OrganizationPermission.REPORTS_CREATE,
      OrganizationPermission.REPORTS_UPDATE,
      OrganizationPermission.REPORTS_SUBMIT,
      OrganizationPermission.PROGRESS_READ,
      OrganizationPermission.CONVERSATIONS_READ,
      OrganizationPermission.CONVERSATIONS_MANAGE,
    ],
  },
  {
    key: OrganizationRoleKey.TEACHING_ASSISTANT,
    name: 'Teaching Assistant',
    description: 'Supports assigned classrooms and lessons.',
    permissions: [
      OrganizationPermission.SUBJECTS_READ,
      OrganizationPermission.CLASSROOMS_READ,
      OrganizationPermission.LESSONS_READ,
      OrganizationPermission.REPORTS_READ,
      OrganizationPermission.REPORTS_CREATE,
      OrganizationPermission.CONVERSATIONS_READ,
      OrganizationPermission.CONVERSATIONS_MANAGE,
    ],
  },
];
