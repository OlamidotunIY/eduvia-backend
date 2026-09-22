const OUTBOX_EVENT_ROUTES = new Map<string, string>([
  ['AuthAccountCreatedEvent', 'user-events'],
  ['AuthEmailVerifiedEvent', 'user-events'],
  ['AccountSuspendedEvent', 'user-events'],
  ['UserCreatedEvent', 'auth-events'],
  ['UserUpdatedEvent', 'auth-events'],
]);

export { OUTBOX_EVENT_ROUTES };
