import { IQuery } from '@nestjs/cqrs';

export class GetPendingVerificationQuery implements IQuery {
  constructor(public readonly payload: { authAccountId: number }) {}
}
