import { Injectable } from '@nestjs/common';
import { IUserQueryPort, UserDTO } from '@modules/shared';
import { User, IUserRepository } from '../../domain';

@Injectable()
export class UserQueryAdapter implements IUserQueryPort {
  constructor(private readonly userRepository: IUserRepository) {}

  async getUserByEmail(email: string): Promise<UserDTO | null> {
    const user = await this.userRepository.getUserByEmail(email);
    return user ? this.toDTO(user) : null;
  }

  async getUserById(id: string): Promise<UserDTO | null> {
    const user = await this.userRepository.findById(id);
    return user ? this.toDTO(user) : null;
  }

  private toDTO(user: User): UserDTO {
    return {
      id: user.getId(),
      userType: user.userType,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      emailVerified: user.emailVerified,
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
    };
  }
}
