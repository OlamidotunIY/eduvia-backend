import { UserType } from '../../../domain';

export interface CompleteUserOnboardingPayload {
  userId: string;
  userType: UserType;
  firstName: string;
  lastName: string;
  timezone: string | undefined;
  correlationId: string;
}

export interface CompleteUserOnboardingResult {
  id: string;
  nextStep: 'parent_dashboard' | 'teacher_organization_choice';
}
