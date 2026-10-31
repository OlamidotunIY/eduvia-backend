import {
  InitialActiveOrganizationRequestedEvent,
  OrganizationMembership,
  OrganizationRole,
  OrganizationId,
} from '../domain';

describe('OrganizationMembership', () => {
  it('requests an initial active organization without making it a later switch', () => {
    const membership = OrganizationMembership.create({
      orgId: OrganizationId.from('018f9210-9c24-7123-8345-abcdef123456'),
      userId: 'user-1',
      role: OrganizationRole.TEACHER,
      activateForUserIfUnset: true,
      correlationId: 'correlation-1',
    });

    const events = membership.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(InitialActiveOrganizationRequestedEvent);
    expect(events[0].payload).toMatchObject({
      userId: 'user-1',
      organizationId: '018f9210-9c24-7123-8345-abcdef123456',
    });
  });
});
