import { IQuery } from '@nestjs/cqrs';
import { AnnouncementStatus } from '../../../domain';

export class ListPlatformAnnouncementsQuery implements IQuery {
  constructor(public readonly status?: AnnouncementStatus) {}
}
