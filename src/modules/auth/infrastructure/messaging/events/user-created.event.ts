export class UserCreatedEvent {
  static readonly eventName = 'UserCreatedEvent';

  constructor(
    public readonly payload: {
      userId: string;
      userType: string;
      email: string;
      passwordHash: string;
    },
    public readonly correlationId: string,
  ) {}
}
