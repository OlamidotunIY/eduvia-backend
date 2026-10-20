import { UserType } from '../../../domain/value-objects/user-type.v0';

export interface CreateUserPayload {
  userType: UserType;
  email: string;
  firstName: string;
  lastName: string;
  passwordRaw: string;
  timezone?: string;
  correlationId: string;
}

export interface CreateUserResult {
  id: string;
}
