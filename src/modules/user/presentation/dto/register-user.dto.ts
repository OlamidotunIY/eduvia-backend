import { UserType } from '../../domain';

export class RegisterUserDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  userType!: UserType;
  timezone?: string;
}
