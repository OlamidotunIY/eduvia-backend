import { Injectable } from '@nestjs/common';
import { Account as PrismaAuthAccount } from '@generated/prisma/client';
import { AuthAccount, AuthAccountId } from '../../../domain';
import { IMapper } from '@modules/shared';

@Injectable()
export class AuthAccountMapper implements IMapper<
  AuthAccount,
  PrismaAuthAccount
> {
  toDomain(record: PrismaAuthAccount): AuthAccount {
    return AuthAccount.reconstitute({
      id: AuthAccountId.from(record.id),
      accountId: record.accountId,
      providerId: record.providerId,
      userId: record.userId,
      accessToken: record.accessToken,
      refreshToken: record.refreshToken,
      idToken: record.idToken,
      accessTokenExpiresAt: record.accessTokenExpiresAt,
      refreshTokenExpiresAt: record.refreshTokenExpiresAt,
      scope: record.scope,
      password: record.password,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: AuthAccount): Omit<PrismaAuthAccount, 'id'> {
    return {
      accountId: entity.accountId,
      providerId: entity.providerId,
      userId: entity.userId,
      accessToken: entity.accessToken,
      refreshToken: entity.refreshToken,
      idToken: entity.idToken,
      accessTokenExpiresAt: entity.accessTokenExpiresAt,
      refreshTokenExpiresAt: entity.refreshTokenExpiresAt,
      scope: entity.scope,
      password: entity.password,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
