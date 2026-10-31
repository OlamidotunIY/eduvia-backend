import { UserType } from '../../domain';

export class CompleteUserOnboardingDto {
  userType!: UserType;
  firstName!: string;
  lastName!: string;
  timezone?: string;
}
