import { IQuery } from '@nestjs/cqrs';

export class GetParentStudentsQuery implements IQuery {
  constructor(public readonly parentUserId: string) {}
}
