import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain';
import { User } from '../../domain/entities';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { UserMapper } from '../mappers';
import { User as PrismaUser } from '@generated/prisma/client';
import { UserId } from '../../domain/value-objects/user-id.vo';

@Injectable()
export class PrismaUserRepository
  extends PrismaBaseRepository<UserId, User, PrismaUser>
  implements IUserRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly userMapper: UserMapper,
  ) {
    super(prisma, userMapper);
  }

  protected get delegate() {
    return this.prisma.user;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const userRecord = await this.delegate.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!userRecord) return null;

    return this.mapper.toDomain(userRecord);
  }

  public async updateUserEmail(userId: UserId | string, email: string): Promise<void> {
    await this.delegate.update({
      where: { id: String(userId) },
      data: { email: email.toLowerCase() },
    });
  }
}
