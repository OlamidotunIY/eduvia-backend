export class UserRegistrationCreatedEvent {
  static readonly eventName = 'UserRegistrationCreatedEvent';

  constructor(
    public readonly payload: {
      registrationRequestId: string;
      userId: string;
      email: string;
    },
    public readonly correlationId: string,
  ) {}
}
