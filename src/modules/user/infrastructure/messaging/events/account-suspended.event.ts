export class AccountSuspendedEvent {
  static readonly eventName = 'AccountSuspendedEvent';

  constructor(
    public readonly payload: { userId: string },
    public readonly correlationId: string,
  ) {}
}
