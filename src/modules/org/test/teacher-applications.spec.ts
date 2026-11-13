jest.mock('@nestjs/swagger', () => ({
  ApiProperty: () => () => undefined,
  ApiPropertyOptional: () => () => undefined,
}));

import { OrganizationRole, OrganizationRoleId, OrganizationRoleKey, OrganizationPermission } from '../domain/value-objects';
import { Organization } from '../domain/model/Organization';
import { TeacherApplication } from '../domain/entities';
import { ApproveTeacherApplicationCommand, ApproveTeacherApplicationHandler } from '../application/commands/approve-teacher-application';
import { ReceiveTeacherApplicationCommand, ReceiveTeacherApplicationHandler } from '../application/commands/receive-teacher-application';
import { GetTeacherApplicationsHandler, GetTeacherApplicationsQuery } from '../application/queries/get-teacher-applications';
import { ApplicationStatus, OrganizationId } from '../domain/value-objects';

describe('Teacher Applications', () => {
  it('allows approving an application with adjusted subjects and selected role', async () => {
    const application = TeacherApplication.create({
      orgId: OrganizationId.from('org-1'),
      applicantUserId: 'user-applicant',
      appliedSubjects: ['sub-1', 'sub-2'],
      coverLetter: 'Excited to teach STEM.',
      qualifications: 'B.Sc. Mathematics',
      correlationId: 'corr-1',
    });

    const repo = {
      findById: jest.fn().mockResolvedValue(application),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const authQuery = {
      getEffectiveAuthorization: jest.fn().mockResolvedValue({
        isActive: true,
        permissions: [OrganizationPermission.APPLICATIONS_REVIEW],
      }),
    };
    const roleRepo = {
      findById: jest.fn().mockResolvedValue({
        getId: () => 'role-lead',
        orgId: OrganizationId.from('org-1'),
        key: OrganizationRoleKey.LEAD_TEACHER,
      }),
    };

    const handler = new ApproveTeacherApplicationHandler(
      repo as never,
      authQuery as never,
      roleRepo as never,
    );

    const result = await handler.execute(
      new ApproveTeacherApplicationCommand({
        applicationId: application.getId(),
        orgId: 'org-1',
        reviewerUserId: 'reviewer-1',
        correlationId: 'corr-2',
        approvedSubjects: ['sub-1', 'sub-3'],
        roleId: 'role-lead',
      }),
    );

    expect(result).toEqual({
      id: application.getId(),
      status: ApplicationStatus.APPROVED,
      approvedSubjects: ['sub-1', 'sub-3'],
      role: OrganizationRole.LEAD_TEACHER,
      roleId: 'role-lead',
    });
    expect(repo.save).toHaveBeenCalledTimes(1);
    const events = application.pullDomainEvents();
    const approvedEvent = events.find((e) => e.eventName === 'TeacherApplicationApprovedEvent');
    expect(approvedEvent?.payload).toMatchObject({
      approvedSubjects: ['sub-1', 'sub-3'],
      role: OrganizationRole.LEAD_TEACHER,
      roleId: 'role-lead',
    });
  });

  it('prevents duplicate pending applications per organization while allowing re-application after rejection', async () => {
    const organization = {
      id: OrganizationId.from('org-1'),
      isActive: () => true,
      acceptingTeachers: true,
    } as unknown as Organization;

    const rejectedApp = TeacherApplication.create({
      orgId: OrganizationId.from('org-1'),
      applicantUserId: 'user-1',
      appliedSubjects: ['Mathematics'],
      correlationId: 'corr-1',
    });
    rejectedApp.reject('reviewer-1', 'Try again next term', 'corr-2');

    const orgRepo = { findById: jest.fn().mockResolvedValue(organization) };
    const appRepo = {
      findByOrgIdAndApplicantUserId: jest.fn().mockResolvedValue(rejectedApp),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const membershipRepo = {
      findByOrgIdAndUserId: jest.fn().mockResolvedValue(null),
    };

    const handler = new ReceiveTeacherApplicationHandler(
      orgRepo as never,
      appRepo as never,
      membershipRepo as never,
    );

    const created = await handler.execute(
      new ReceiveTeacherApplicationCommand({
        orgId: 'org-1',
        applicantUserId: 'user-1',
        appliedSubjects: ['Mathematics', 'Physics', 'Mathematics'],
        coverLetter: '  Updated CV  ',
        qualifications: '  M.Sc. Physics ',
        correlationId: 'corr-3',
      }),
    );

    expect(created.appliedSubjects).toEqual(['Mathematics', 'Physics']);
    expect(appRepo.save).toHaveBeenCalledTimes(1);
  });

  it('enriches teacher applications with applicant profile, reviewer profile, subjects, and membership role', async () => {
    const app = TeacherApplication.create({
      orgId: OrganizationId.from('org-1'),
      applicantUserId: 'user-applicant',
      appliedSubjects: ['sub-1'],
      coverLetter: 'Hello',
      qualifications: 'B.Ed',
      correlationId: 'corr-1',
    });
    app.approve('reviewer-1', 'corr-2', {
      approvedSubjects: ['sub-1'],
      role: OrganizationRole.TEACHER,
      roleId: 'role-teacher',
    });

    const appRepo = {
      findByOrganizationId: jest.fn().mockResolvedValue([app]),
    };
    const authQuery = {
      getEffectiveAuthorization: jest.fn().mockResolvedValue({
        isActive: true,
        permissions: [OrganizationPermission.APPLICATIONS_READ],
      }),
    };
    const userQuery = {
      getUsersByIds: jest.fn().mockResolvedValue([
        { id: 'user-applicant', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@eduvia.test', image: null },
        { id: 'reviewer-1', firstName: 'Grace', lastName: 'Hopper', email: 'grace@eduvia.test', image: null },
      ]),
    };
    const subjectRepo = {
      findByOrganizationId: jest.fn().mockResolvedValue([
        { getId: () => 'sub-1', name: 'Mathematics' },
      ]),
    };
    const membershipRepo = {
      findByOrganizationId: jest.fn().mockResolvedValue([
        {
          userId: 'user-applicant',
          role: OrganizationRole.TEACHER,
          roleId: OrganizationRoleId.from('role-teacher'),
          subjects: ['sub-1'],
        },
      ]),
    };
    const roleRepo = {
      findByOrgId: jest.fn().mockResolvedValue([
        { getId: () => 'role-teacher', name: 'Teacher', key: OrganizationRoleKey.TEACHER },
      ]),
    };

    const handler = new GetTeacherApplicationsHandler(
      appRepo as never,
      authQuery as never,
      userQuery as never,
      subjectRepo as never,
      membershipRepo as never,
      roleRepo as never,
    );

    const list = await handler.execute(new GetTeacherApplicationsQuery('org-1', 'reviewer-1'));
    expect(list).toHaveLength(1);
    expect(list[0].applicant?.fullName).toBe('Ada Lovelace');
    expect(list[0].reviewer?.fullName).toBe('Grace Hopper');
    expect(list[0].appliedSubjectDetails).toEqual([{ id: 'sub-1', name: 'Mathematics' }]);
    expect(list[0].assignedRoleName).toBe('Teacher');
  });
});
