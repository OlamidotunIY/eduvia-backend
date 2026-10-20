import { IQuery } from '@nestjs/cqrs';

export class GetSubscriptionPlanQuery implements IQuery {
  constructor(public readonly planId: string) {}
}
