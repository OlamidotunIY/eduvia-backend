import { IQuery } from '@nestjs/cqrs';

export class GetPlatformAdminByUserIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
