import { OutboxMessage } from "../domain";
import { BaseRepository } from "./base.repository";

export interface IOutboxRepository extends BaseRepository<OutboxMessage, number> {}
