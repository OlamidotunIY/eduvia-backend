import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@generated/prisma/client';
import { IMapper } from '@modules/shared';
import { User } from '../../domain/entities';
import { UserType } from '../../domain/value-objects/user-type.v0';
import { UserStatus } from '../../domain/value-objects/user-status.v0';

@Injectable()
export class UserMapper implements IMapper<User, PrismaUser> {
  toDomain(record: PrismaUser): User {
    return User.reconstitute({
      id: record.id,
      userType: record.userType as UserType,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      status: record.status as UserStatus,
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
      status: entity.status as any,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
