import { IQuery } from '@nestjs/cqrs';
import { UserDTO } from '../../facade/user.facade';

export class GetMeQuery implements IQuery {
  constructor(public readonly payload: { userId: number }) {}
}
