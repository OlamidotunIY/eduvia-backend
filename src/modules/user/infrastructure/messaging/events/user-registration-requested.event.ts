export class UserRegistrationRequestedEvent {
  static readonly eventName = 'UserRegistrationRequestedEvent';

  constructor(
    public readonly payload: {
      registrationRequestId: string;
      email: string;
      firstName: string;
      lastName: string;
      imageUrl: string | null;
      emailVerified: boolean;
      timezone: string;
    },
    public readonly correlationId: string,
  ) {}
}
