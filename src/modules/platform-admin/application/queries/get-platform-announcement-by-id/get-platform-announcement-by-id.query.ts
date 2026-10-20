import { IQuery } from '@nestjs/cqrs';

export class GetPlatformAnnouncementByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}
