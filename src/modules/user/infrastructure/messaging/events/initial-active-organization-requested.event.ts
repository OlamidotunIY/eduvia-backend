export class InitialActiveOrganizationRequestedEvent {
  static readonly eventName = 'InitialActiveOrganizationRequestedEvent';

  declare readonly payload: {
    userId: string;
    organizationId: string;
  };
}
