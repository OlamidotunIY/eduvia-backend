export class AuthEmailVerifiedEvent {
  static readonly eventName = 'AuthEmailVerifiedEvent';

  constructor(
    public readonly payload: {
      authAccountId: string;
      userId: string;
      email: string;
    },
    public readonly correlationId: string,
  ) {}
}
