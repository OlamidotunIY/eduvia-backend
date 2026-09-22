import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@generated/prisma/client';
import { IMapper } from '@modules/shared';
import { User } from '../../domain/entities';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserType } from '../../domain/value-objects/user-type.v0';
import { UserStatus } from '../../domain/value-objects/user-status.v0';

@Injectable()
export class UserMapper implements IMapper<User, PrismaUser> {
  toDomain(record: PrismaUser): User {
    return User.reconstitute({
      id: UserId.from(record.id),
      userType: record.userType as UserType,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      username: record.username,
      image: record.image,
      emailVerified: record.emailVerified,
      twoFactorEnabled: record.twoFactorEnabled,
      status: record.status as UserStatus,
      timezone: record.timezone,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: User): Omit<PrismaUser, 'id'> {
    return {
      userType: entity.userType as any,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      username: entity.username,
      image: entity.image,
      emailVerified: entity.emailVerified,
      twoFactorEnabled: entity.twoFactorEnabled,
      status: entity.status as any,
      timezone: entity.timezone,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
