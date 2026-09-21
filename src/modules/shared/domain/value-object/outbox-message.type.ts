import { OutboxStatus } from "./outbox-status.v0";

export type OutBoxMessageType = {
  id: string;
  eventId: string;
  type: string;
  payload: Record<string, unknown>;
  aggregateType: string;
  aggregateId: string;
  correlationId: string;
  occurredAt: Date;
  status: OutboxStatus;
};
