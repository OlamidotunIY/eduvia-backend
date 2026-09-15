import { UserType } from '../../../domain/value-objects/user-type.v0';

export interface CreateUserPayload {
  id: number;
  userType: UserType;
  email: string;
  firstName: string;
  lastName: string;
  authAccountId?: number;
  correlationId: string;
}

export interface CreateUserResult {
  id: number;
}
