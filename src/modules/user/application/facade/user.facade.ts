import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repository/user.repository';

export interface UserDTO {
  id: string;
  userType: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class UserFacade {
  constructor(private readonly userRepository: IUserRepository) {}

  async getUserIdByEmail(email: string): Promise<UserDTO | null> {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) return null;

    return {
      id: user.getId(),
      userType: user.userType,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async getUserById(id: string): Promise<UserDTO | null> {
    const user = await this.userRepository.findById(id);

    if (!user) return null;

    return {
      id: user.getId(),
      userType: user.userType,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
