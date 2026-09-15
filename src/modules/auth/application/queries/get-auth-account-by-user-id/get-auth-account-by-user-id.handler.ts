import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAuthAccountByUserIdQuery } from './get-auth-account-by-user-id.query';
import { IAuthAccountRepository } from '../../../domain/repository/auth-account.repository';
import { AuthAccountDTO } from '../get-auth-account/get-auth-account.query.payload';

@QueryHandler(GetAuthAccountByUserIdQuery)
export class GetAuthAccountByUserIdHandler implements IQueryHandler<GetAuthAccountByUserIdQuery> {
  constructor(private readonly authAccountRepository: IAuthAccountRepository) {}

  async execute(query: GetAuthAccountByUserIdQuery): Promise<AuthAccountDTO> {
    const { payload } = query;

    const authAccount = await this.authAccountRepository.findByUserId(
      payload.userId,
    );

    if (!authAccount) {
      throw new Error('Auth Account not found');
    }

    return {
      id: authAccount.getId(),
      userId: authAccount.userId,
      credentialHash: authAccount.credentialHash,
      scope: authAccount.scope,
      totpEnabled: authAccount.totpEnabled,
      authStatus: authAccount.authStatus,
      createdAt: authAccount.createdAt,
      updatedAt: authAccount.updatedAt,
    };
  }
}
