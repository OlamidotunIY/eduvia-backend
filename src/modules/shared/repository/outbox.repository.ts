import { OutboxMessage } from "../domain";
import { BaseRepository } from "./base.repository";
import { OutboxMessageId } from '../domain/value-object';

export interface IOutboxRepository extends BaseRepository<OutboxMessage, OutboxMessageId> {}
