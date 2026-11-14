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
    name: 'Owner',
    description: 'Full access to the organization, including settings, people, roles and academic data.',
    permissions: allPermissions,
  },
  {
    key: OrganizationRoleKey.ORG_ADMIN,
    name: 'Admin',
    description: 'Manage people, classrooms, curriculum, assessments and organization settings.',
    permissions: allPermissions.filter(
      (permission) => permission !== OrganizationPermission.BILLING_MANAGE,
    ),
  },
  {
    key: OrganizationRoleKey.LEAD_TEACHER,
    name: 'Lead Teacher',
    description: 'Oversee teaching activities, review content and support other teachers.',
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
      OrganizationPermission.ASSESSMENTS_READ,
      OrganizationPermission.ASSESSMENTS_CREATE,
      OrganizationPermission.REPORTS_READ,
      OrganizationPermission.PROGRESS_READ,
      OrganizationPermission.CONVERSATIONS_READ,
    ],
  },
  {
    key: OrganizationRoleKey.TEACHER,
    name: 'Teacher',
    description: 'Create and manage lessons, assessments and student progress for assigned classes.',
    permissions: [
      OrganizationPermission.CLASSROOMS_READ,
      OrganizationPermission.CLASSROOMS_CREATE,
      OrganizationPermission.CLASSROOMS_UPDATE,
      OrganizationPermission.CLASSROOMS_MANAGE_STUDENTS,
      OrganizationPermission.LESSONS_READ,
      OrganizationPermission.LESSONS_SCHEDULE,
      OrganizationPermission.LESSONS_MANAGE,
      OrganizationPermission.QUESTIONS_READ,
      OrganizationPermission.ASSESSMENTS_READ,
      OrganizationPermission.ASSESSMENTS_CREATE,
      OrganizationPermission.PROGRESS_READ,
      OrganizationPermission.REPORTS_READ,
      OrganizationPermission.CONVERSATIONS_READ,
    ],
  },
  {
    key: OrganizationRoleKey.ACADEMIC_COORDINATOR,
    name: 'Academic Coordinator',
    description: 'Coordinate academic planning, monitor teaching quality and ensure curriculum alignment.',
    permissions: [
      OrganizationPermission.SUBJECTS_READ,
      OrganizationPermission.CLASSROOMS_READ,
      OrganizationPermission.CLASSROOMS_CREATE,
      OrganizationPermission.CLASSROOMS_UPDATE,
      OrganizationPermission.LESSONS_READ,
      OrganizationPermission.LESSONS_SCHEDULE,
      OrganizationPermission.LESSONS_MANAGE,
      OrganizationPermission.CURRICULUM_READ,
      OrganizationPermission.CURRICULUM_MANAGE,
      OrganizationPermission.QUESTIONS_READ,
      OrganizationPermission.ASSESSMENTS_READ,
      OrganizationPermission.REPORTS_READ,
      OrganizationPermission.PROGRESS_READ,
      OrganizationPermission.ANALYTICS_READ,
    ],
  },
  {
    key: OrganizationRoleKey.TEACHING_ASSISTANT,
    name: 'Teaching Assistant',
    description: 'Support teachers with class activities, grading and learner support.',
    permissions: [
      OrganizationPermission.SUBJECTS_READ,
      OrganizationPermission.CLASSROOMS_READ,
      OrganizationPermission.LESSONS_READ,
      OrganizationPermission.REPORTS_READ,
      OrganizationPermission.REPORTS_CREATE,
      OrganizationPermission.PROGRESS_READ,
      OrganizationPermission.CONVERSATIONS_READ,
      OrganizationPermission.CONVERSATIONS_MANAGE,
    ],
  },
];
