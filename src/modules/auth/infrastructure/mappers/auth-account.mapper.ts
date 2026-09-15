import { Injectable } from '@nestjs/common';
import {
  AuthAccount as PrismaAuthAccount,
  AuthStatus as PrismaAuthStatus,
  UserType as PrismaUserType,
} from '@generated/prisma/client';
import { AuthAccount, AuthStatus } from '../../domain';
import { UserType } from '@module/user';
import { IMapper } from '@module/shared';

@Injectable()
export class AuthAccountMapper implements IMapper<
  AuthAccount,
  PrismaAuthAccount
> {
  toDomain(record: PrismaAuthAccount): AuthAccount {
    return AuthAccount.reconstitute({
      id: record.id,
      userId: record.userId,
      userType: record.userType as unknown as UserType,
      credentialHash: record.credentialHash,
      scope: record.scope,
      totpSecret: record.totpSecret,
      totpEnabled: record.totpEnabled,
      authStatus: record.authStatus as unknown as AuthStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: AuthAccount): Omit<PrismaAuthAccount, 'id'> {
    return {
      userId: entity.userId,
      userType: entity.userType as unknown as PrismaUserType,
      credentialHash: entity.credentialHash,
      scope: entity.scope,
      totpSecret: entity.getTotpSecretForPersistence(),
      totpEnabled: entity.totpEnabled,
      authStatus: entity.authStatus as unknown as PrismaAuthStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
