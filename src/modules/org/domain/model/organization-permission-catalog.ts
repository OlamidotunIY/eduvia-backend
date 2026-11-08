import { OrganizationPermission } from '../value-objects';

export interface OrganizationPermissionDefinition {
  id: OrganizationPermission;
  name: string;
  category: string;
  description: string;
}

export const ORGANIZATION_PERMISSION_CATALOG: OrganizationPermissionDefinition[] = [
  // Classroom Management
  {
    id: OrganizationPermission.CLASSROOMS_READ,
    name: 'View classrooms',
    category: 'Classroom Management',
    description: 'View classrooms and schedules',
  },
  {
    id: OrganizationPermission.CLASSROOMS_CREATE,
    name: 'Create classrooms',
    category: 'Classroom Management',
    description: 'Create new classroom spaces',
  },
  {
    id: OrganizationPermission.CLASSROOMS_UPDATE,
    name: 'Update classrooms',
    category: 'Classroom Management',
    description: 'Update classroom configuration and settings',
  },
  {
    id: OrganizationPermission.CLASSROOMS_MANAGE_STUDENTS,
    name: 'Manage class members',
    category: 'Classroom Management',
    description: 'Add, remove or reassign learners in classrooms',
  },
  {
    id: OrganizationPermission.SUBJECTS_READ,
    name: 'View subjects',
    category: 'Classroom Management',
    description: 'View active organization subjects',
  },
  {
    id: OrganizationPermission.SUBJECTS_CREATE,
    name: 'Create subjects',
    category: 'Classroom Management',
    description: 'Add new subjects to the organization curriculum',
  },
  {
    id: OrganizationPermission.SUBJECTS_UPDATE,
    name: 'Update subjects',
    category: 'Classroom Management',
    description: 'Modify subject details and active status',
  },

  // Lesson Management
  {
    id: OrganizationPermission.LESSONS_READ,
    name: 'View lessons',
    category: 'Lesson Management',
    description: 'View planned and past lessons',
  },
  {
    id: OrganizationPermission.LESSONS_SCHEDULE,
    name: 'Schedule lessons',
    category: 'Lesson Management',
    description: 'Book and timetable upcoming class lessons',
  },
  {
    id: OrganizationPermission.LESSONS_MANAGE,
    name: 'Manage lessons',
    category: 'Lesson Management',
    description: 'Start, conduct, and finalize lessons',
  },
  {
    id: OrganizationPermission.CURRICULUM_READ,
    name: 'View curriculum',
    category: 'Lesson Management',
    description: 'Browse curriculum trees and frameworks',
  },
  {
    id: OrganizationPermission.CURRICULUM_MANAGE,
    name: 'Manage curriculum',
    category: 'Lesson Management',
    description: 'Adopt and manage custom curriculum frameworks',
  },

  // Assessment Management
  {
    id: OrganizationPermission.ASSESSMENTS_READ,
    name: 'View assessments',
    category: 'Assessment Management',
    description: 'View student quizzes, tests, and homework',
  },
  {
    id: OrganizationPermission.ASSESSMENTS_CREATE,
    name: 'Create assessments',
    category: 'Assessment Management',
    description: 'Design and assign new assessments to classrooms',
  },
  {
    id: OrganizationPermission.ASSESSMENTS_MARK,
    name: 'Mark assessments',
    category: 'Assessment Management',
    description: 'Grade assessment submissions and provide feedback',
  },
  {
    id: OrganizationPermission.ASSESSMENTS_FINALIZE,
    name: 'Finalize assessments',
    category: 'Assessment Management',
    description: 'Publish final assessment results to parents and learners',
  },
  {
    id: OrganizationPermission.QUESTIONS_READ,
    name: 'View question bank',
    category: 'Assessment Management',
    description: 'Browse repository of questions and items',
  },
  {
    id: OrganizationPermission.QUESTIONS_CREATE,
    name: 'Create questions',
    category: 'Assessment Management',
    description: 'Author new questions in the question bank',
  },
  {
    id: OrganizationPermission.QUESTIONS_UPDATE,
    name: 'Update questions',
    category: 'Assessment Management',
    description: 'Edit existing question contents and rubrics',
  },
  {
    id: OrganizationPermission.QUESTIONS_DELETE,
    name: 'Delete questions',
    category: 'Assessment Management',
    description: 'Remove deprecated questions from the bank',
  },
  {
    id: OrganizationPermission.QUESTIONS_PUBLISH,
    name: 'Publish questions',
    category: 'Assessment Management',
    description: 'Approve questions for organization-wide use',
  },

  // Student Progress
  {
    id: OrganizationPermission.PROGRESS_READ,
    name: 'View student progress',
    category: 'Student Progress',
    description: 'Monitor individual and group academic growth',
  },
  {
    id: OrganizationPermission.REPORTS_READ,
    name: 'View reports',
    category: 'Student Progress',
    description: 'Access lesson, learner, and term evaluation reports',
  },
  {
    id: OrganizationPermission.REPORTS_CREATE,
    name: 'Create reports',
    category: 'Student Progress',
    description: 'Draft lesson reports and learner feedback',
  },
  {
    id: OrganizationPermission.REPORTS_UPDATE,
    name: 'Update reports',
    category: 'Student Progress',
    description: 'Modify draft lesson and performance reports',
  },
  {
    id: OrganizationPermission.REPORTS_SUBMIT,
    name: 'Submit reports',
    category: 'Student Progress',
    description: 'Submit reports for supervisory review',
  },
  {
    id: OrganizationPermission.REPORTS_APPROVE_AI,
    name: 'Approve AI reports',
    category: 'Student Progress',
    description: 'Verify and authorize AI-generated performance summaries',
  },
  {
    id: OrganizationPermission.ANALYTICS_READ,
    name: 'View analytics',
    category: 'Student Progress',
    description: 'Analyze organization, classroom and subject trends',
  },

  // Communication
  {
    id: OrganizationPermission.CONVERSATIONS_READ,
    name: 'View conversations',
    category: 'Communication',
    description: 'Read class, staff, and direct messages',
  },
  {
    id: OrganizationPermission.CONVERSATIONS_MANAGE,
    name: 'Manage conversations',
    category: 'Communication',
    description: 'Create channels, manage groups and moderate chats',
  },

  // Organization Management
  {
    id: OrganizationPermission.ORGANIZATION_READ,
    name: 'View organization details',
    category: 'Organization Management',
    description: 'View organization profile, branding, and stats',
  },
  {
    id: OrganizationPermission.ORGANIZATION_UPDATE,
    name: 'Update organization profile',
    category: 'Organization Management',
    description: 'Modify name, logo, contact information, and timezones',
  },
  {
    id: OrganizationPermission.ORGANIZATION_POLICY_UPDATE,
    name: 'Update organization policy',
    category: 'Organization Management',
    description: 'Adjust attendance, grading, and operational policies',
  },
  {
    id: OrganizationPermission.ORGANIZATION_MARKETPLACE_MANAGE,
    name: 'Manage marketplace listing',
    category: 'Organization Management',
    description: 'List or delist organization from the public tutor directory',
  },
  {
    id: OrganizationPermission.ROLES_READ,
    name: 'View roles and permissions',
    category: 'Organization Management',
    description: 'Review custom and system roles and access lists',
  },
  {
    id: OrganizationPermission.ROLES_MANAGE,
    name: 'Manage roles and permissions',
    category: 'Organization Management',
    description: 'Create, update, and configure member roles and rights',
  },
  {
    id: OrganizationPermission.MEMBERS_READ,
    name: 'View members',
    category: 'Organization Management',
    description: 'List team members and their statuses',
  },
  {
    id: OrganizationPermission.MEMBERS_INVITE,
    name: 'Invite members',
    category: 'Organization Management',
    description: 'Send organization invitations to instructors and staff',
  },
  {
    id: OrganizationPermission.MEMBERS_MANAGE,
    name: 'Manage members',
    category: 'Organization Management',
    description: 'Change roles or suspend/remove organization members',
  },
  {
    id: OrganizationPermission.APPLICATIONS_READ,
    name: 'View teacher applications',
    category: 'Organization Management',
    description: 'Review teacher join requests and credentials',
  },
  {
    id: OrganizationPermission.APPLICATIONS_REVIEW,
    name: 'Review teacher applications',
    category: 'Organization Management',
    description: 'Approve or reject teacher join applications',
  },
  {
    id: OrganizationPermission.BILLING_READ,
    name: 'View billing',
    category: 'Organization Management',
    description: 'View subscription plans and payment history',
  },
  {
    id: OrganizationPermission.BILLING_MANAGE,
    name: 'Manage billing',
    category: 'Organization Management',
    description: 'Upgrade subscriptions, manage invoices and payment methods',
  },
];
