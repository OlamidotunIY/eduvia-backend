import { OutboxStatus } from "./outbox-status.v0";

export type OutBoxMessageType = {
  id: number;
  type: string;
  payload: Record<string, unknown>;
  aggregateType: string;
  aggregateId: number;
  status: OutboxStatus;
};
