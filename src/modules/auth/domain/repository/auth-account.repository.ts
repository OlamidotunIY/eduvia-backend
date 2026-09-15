import { BaseRepository } from '../../../shared/repository/base.repository';
import { AuthAccount } from '../model/AuthAccount';
import { AuthAccountId } from '../value-objects/auth-account-id.vo';

abstract class IAuthAccountRepository extends BaseRepository<
  AuthAccount,
  AuthAccountId
> {
  abstract findByUserId(userId: string): Promise<AuthAccount | null>;
}

export { IAuthAccountRepository };
