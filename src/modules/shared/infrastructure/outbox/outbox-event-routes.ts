const OUTBOX_EVENT_ROUTES = new Map<string, string>([
  ['AuthAccountCreatedEvent', 'user-events'],
  ['AuthEmailVerifiedEvent', 'user-events'],
  ['AccountSuspendedEvent', 'user-events'],
  ['UserCreatedEvent', 'auth-events'],
  ['UserUpdatedEvent', 'auth-events'],
  ['OrganizationCreatedEvent', 'org-events'],
  ['OrganizationApprovedEvent', 'org-events'],
  ['OrganizationSuspendedEvent', 'org-events'],
  ['TeacherApplicationReceivedEvent', 'org-events'],
  ['TeacherApplicationApprovedEvent', 'org-events'],
  ['TeacherApplicationRejectedEvent', 'org-events'],
  ['OrganizationInvitationAcceptedEvent', 'org-events'],
]);

export { OUTBOX_EVENT_ROUTES };
