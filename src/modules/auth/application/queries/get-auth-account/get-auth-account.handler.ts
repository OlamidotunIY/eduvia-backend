import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAuthAccountQuery } from './get-auth-account-query';
import { IAuthAccountRepository } from '../../../domain/repository/auth-account.repository';
import { AuthAccountDTO } from './get-auth-account.query.payload';


@QueryHandler(GetAuthAccountQuery)
export class GetAuthAccountHandler implements IQueryHandler<GetAuthAccountQuery> {
  constructor(private readonly authAccountRepository: IAuthAccountRepository) {}

  async execute(query: GetAuthAccountQuery): Promise<AuthAccountDTO> {
    const { payload } = query;

    const authAccount = await this.authAccountRepository.findById(
      payload.authAccountId,
    );

    if (!authAccount) {
      throw new Error("Auth Account not found");
    }

    return {
      id: authAccount.getId(),
      userId: authAccount.userId,
      userType: authAccount.userType,
      credentialHash: authAccount.credentialHash,
      scope: authAccount.scope,
      totpEnabled: authAccount.totpEnabled,
      authStatus: authAccount.authStatus,
      createdAt: authAccount.createdAt,
      updatedAt: authAccount.updatedAt,
    };
  }
}
