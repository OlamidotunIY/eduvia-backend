import { OutboxMessage } from '..';
import { BaseRepository } from './base.repository';
import { OutboxMessageId } from '../value-object';

export interface IOutboxRepository extends BaseRepository<
  OutboxMessage,
  OutboxMessageId
> {}
