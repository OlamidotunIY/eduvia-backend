import { Injectable } from '@nestjs/common';
import { IUserQueryPort, PrismaService, UserDTO } from '@modules/shared';
import { User, IUserRepository } from '../../domain';

@Injectable()
export class UserQueryAdapter implements IUserQueryPort {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getUserByEmail(email: string): Promise<UserDTO | null> {
    const user = await this.userRepository.getUserByEmail(email);
    return user ? this.toDTO(user) : null;
  }

  async getUserById(id: string): Promise<UserDTO | null> {
    const user = await this.userRepository.findById(id);
    return user ? this.toDTO(user) : null;
  }

  async getStudentCountryCodes(studentIds: string[]): Promise<string[]> {
    if (!studentIds.length) return [];
    const profiles = await this.prisma.studentProfile.findMany({
      where: {
        id: { in: studentIds },
      },
      select: { countryCode: true },
      distinct: ['countryCode'],
    });
    return profiles.map((p) => p.countryCode).filter(Boolean);
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
      onboardingStatus: user.onboardingStatus,
      timezone: user.timezone,
      image: user.image,
      activeOrganizationId: user.activeOrganizationId,
    };
  }
}
