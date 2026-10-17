import {
  OrgApprovalRecord,
  OrgApprovalRecordId,
  ApprovalDecision,
  OrgApprovedEvent,
  OrgRejectedEvent,
  OrgSuspendedEvent,
  OrgReactivatedEvent,
  BusinessRuleViolationError,
} from '../domain';

describe('OrgApprovalRecord AggregateRoot', () => {
  it('should create an approved decision record and emit OrgApprovedEvent', () => {
    const record = OrgApprovalRecord.create({
      orgId: 'org-123',
      reviewedBy: 'super-admin-1',
      decision: ApprovalDecision.approved,
    });

    expect(record.id).toBeInstanceOf(OrgApprovalRecordId);
    expect(record.orgId).toBe('org-123');
    expect(record.reviewedBy).toBe('super-admin-1');
    expect(record.decision).toBe(ApprovalDecision.approved);
    expect(record.reason).toBeNull();

    const events = record.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrgApprovedEvent);
    expect(events[0].eventName).toBe('OrgApprovedEvent');
    expect((events[0] as OrgApprovedEvent).payload.orgId).toBe('org-123');
  });

  it('should create a rejected decision record and emit OrgRejectedEvent', () => {
    const record = OrgApprovalRecord.create({
      orgId: 'org-456',
      reviewedBy: 'super-admin-1',
      decision: ApprovalDecision.rejected,
      reason: 'Incomplete accreditation documents.',
    });

    expect(record.decision).toBe(ApprovalDecision.rejected);
    expect(record.reason).toBe('Incomplete accreditation documents.');

    const events = record.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrgRejectedEvent);
    expect(events[0].eventName).toBe('OrgRejectedEvent');
  });

  it('should throw BusinessRuleViolationError when rejecting without a reason', () => {
    expect(() =>
      OrgApprovalRecord.create({
        orgId: 'org-789',
        reviewedBy: 'super-admin-1',
        decision: ApprovalDecision.rejected,
      }),
    ).toThrow(BusinessRuleViolationError);
  });

  it('should create a suspended decision record and emit OrgSuspendedEvent', () => {
    const record = OrgApprovalRecord.create({
      orgId: 'org-111',
      reviewedBy: 'super-admin-1',
      decision: ApprovalDecision.suspended,
      reason: 'Terms of service violation.',
    });

    expect(record.decision).toBe(ApprovalDecision.suspended);

    const events = record.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrgSuspendedEvent);
  });

  it('should create a reactivated decision record and emit OrgReactivatedEvent', () => {
    const record = OrgApprovalRecord.create({
      orgId: 'org-111',
      reviewedBy: 'super-admin-1',
      decision: ApprovalDecision.reactivated,
    });

    expect(record.decision).toBe(ApprovalDecision.reactivated);

    const events = record.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrgReactivatedEvent);
  });

  it('should reconstitute an existing OrgApprovalRecord without events', () => {
    const id = OrgApprovalRecordId.create();
    const now = new Date();
    const record = OrgApprovalRecord.reconstitute({
      id,
      orgId: 'org-999',
      reviewedBy: 'admin-1',
      decision: ApprovalDecision.approved,
      reason: null,
      reviewedAt: now,
      createdAt: now,
    });

    expect(record.id.equals(id)).toBe(true);
    expect(record.orgId).toBe('org-999');
    expect(record.pullDomainEvents()).toHaveLength(0);
  });
});
