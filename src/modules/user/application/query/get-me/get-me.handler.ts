import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMeQuery } from './get-me.query';
import { UserFacade, UserDTO } from '../../facade/user.facade';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery, UserDTO> {
  constructor(private readonly userFacade: UserFacade) {}

  async execute(query: GetMeQuery): Promise<UserDTO> {
    const user = await this.userFacade.getUserById(query.payload.userId);
    if (!user) {
      throw new Error('User not found'); // Convert to generic not found exception in filter
    }
    return user;
  }
}
