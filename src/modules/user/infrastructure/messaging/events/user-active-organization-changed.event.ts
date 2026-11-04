export class UserActiveOrganizationChangedEvent {
  static readonly eventName = 'UserActiveOrganizationChangedEvent';
  constructor(
    public readonly payload: { userId: string; organizationId: string },
    public readonly correlationId: string,
  ) {}
}
