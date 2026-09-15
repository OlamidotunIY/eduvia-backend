import { IQuery } from '@nestjs/cqrs';

export class GetAuthAccountByUserIdQuery implements IQuery {
  constructor(public readonly payload: { userId: string }) {}
}
